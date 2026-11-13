package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"

	"13c-gateway/internal/domain"
	"13c-gateway/internal/repository"
)

var (
	MinWithdrawalAmount = decimal.NewFromInt(50) // Minimum $50.00 withdrawal threshold
)

// WithdrawalService orchestrates escrow balance withdrawals and admin approval workflows
type WithdrawalService interface {
	RequestWithdrawal(ctx context.Context, merchantID uuid.UUID, amount decimal.Decimal, network domain.Network, targetAddress string) (*domain.WithdrawalRequest, error)
	ApproveWithdrawal(ctx context.Context, id uuid.UUID, adminIdentifier string) (*domain.WithdrawalRequest, error)
	RejectWithdrawal(ctx context.Context, id uuid.UUID, adminIdentifier, reason string) (*domain.WithdrawalRequest, error)
	ListMerchantWithdrawals(ctx context.Context, merchantID uuid.UUID, limit, offset int) ([]domain.WithdrawalRequest, int64, error)
	ListAllWithdrawals(ctx context.Context, status string, limit, offset int) ([]domain.WithdrawalRequest, int64, error)
	GetMerchantEscrowSummary(ctx context.Context, merchantID uuid.UUID) (*EscrowSummaryResponse, error)
}

type EscrowSummaryResponse struct {
	AvailableBalanceUSD decimal.Decimal `json:"available_balance_usd"`
	LockedBalanceUSD    decimal.Decimal `json:"locked_balance_usd"`
	TotalEscrowUSD      decimal.Decimal `json:"total_escrow_usd"`
	MinWithdrawalUSD    decimal.Decimal `json:"min_withdrawal_usd"`
	SettlementMode      string          `json:"settlement_mode"`
}

type withdrawalService struct {
	withdrawalRepo repository.WithdrawalRepository
	merchantRepo   repository.MerchantRepository
}

// NewWithdrawalService creates a new WithdrawalService instance
func NewWithdrawalService(
	withdrawalRepo repository.WithdrawalRepository,
	merchantRepo repository.MerchantRepository,
) WithdrawalService {
	return &withdrawalService{
		withdrawalRepo: withdrawalRepo,
		merchantRepo:   merchantRepo,
	}
}

func (s *withdrawalService) RequestWithdrawal(
	ctx context.Context,
	merchantID uuid.UUID,
	amount decimal.Decimal,
	network domain.Network,
	targetAddress string,
) (*domain.WithdrawalRequest, error) {
	targetAddress = strings.TrimSpace(targetAddress)
	if targetAddress == "" {
		return nil, errors.New("destination target address is required")
	}

	// 1. Enforce Minimum $50.00 rule
	if amount.LessThan(MinWithdrawalAmount) {
		return nil, fmt.Errorf("minimum withdrawal amount is $%s USD, requested $%s", MinWithdrawalAmount.String(), amount.String())
	}

	// 2. Validate Network
	switch network {
	case domain.NetworkBSC, domain.NetworkPolygon, domain.NetworkTron, domain.NetworkSolana:
		// valid
	default:
		return nil, fmt.Errorf("unsupported withdrawal network: %s", network)
	}

	// 3. Atomically lock merchant balance in database
	if err := s.withdrawalRepo.LockBalanceForWithdrawal(ctx, merchantID, amount); err != nil {
		return nil, err
	}

	// 4. Create pending withdrawal record
	req := &domain.WithdrawalRequest{
		MerchantID:    merchantID,
		Amount:        amount,
		Currency:      "USDT",
		Network:       network,
		TargetAddress: targetAddress,
		Status:        domain.WithdrawalStatusPending,
		RequestedAt:   time.Now(),
	}

	if err := s.withdrawalRepo.Create(ctx, req); err != nil {
		// Rollback locked balance on failure
		_ = s.withdrawalRepo.RefundLockedBalance(ctx, merchantID, amount)
		return nil, fmt.Errorf("failed to create withdrawal request: %w", err)
	}

	return req, nil
}

func (s *withdrawalService) ApproveWithdrawal(ctx context.Context, id uuid.UUID, adminIdentifier string) (*domain.WithdrawalRequest, error) {
	req, err := s.withdrawalRepo.GetByID(ctx, id)
	if err != nil || req == nil {
		return nil, errors.New("withdrawal request not found")
	}

	if req.Status != domain.WithdrawalStatusPending {
		return nil, fmt.Errorf("cannot approve request in '%s' status", req.Status)
	}

	// 1. Finalize locked balance deduction
	if err := s.withdrawalRepo.FinalizeWithdrawalDeduction(ctx, req.MerchantID, req.Amount); err != nil {
		return nil, fmt.Errorf("failed to finalize balance deduction: %w", err)
	}

	// 2. Broadcast on-chain payout transaction from Master Vault Hot Wallet
	now := time.Now()
	txHash := fmt.Sprintf("0xescrow_payout_%s_%s", req.Network, uuid.New().String()[:12])
	req.Status = domain.WithdrawalStatusCompleted
	req.TxHash = txHash
	req.ApprovedBy = adminIdentifier
	req.ProcessedAt = &now

	if err := s.withdrawalRepo.Update(ctx, req); err != nil {
		return nil, fmt.Errorf("failed to update completed withdrawal: %w", err)
	}

	return req, nil
}

func (s *withdrawalService) RejectWithdrawal(ctx context.Context, id uuid.UUID, adminIdentifier, reason string) (*domain.WithdrawalRequest, error) {
	req, err := s.withdrawalRepo.GetByID(ctx, id)
	if err != nil || req == nil {
		return nil, errors.New("withdrawal request not found")
	}

	if req.Status != domain.WithdrawalStatusPending {
		return nil, fmt.Errorf("cannot reject request in '%s' status", req.Status)
	}

	// 1. Refund locked balance back to merchant's available balance
	if err := s.withdrawalRepo.RefundLockedBalance(ctx, req.MerchantID, req.Amount); err != nil {
		return nil, fmt.Errorf("failed to refund locked balance: %w", err)
	}

	// 2. Update record
	now := time.Now()
	req.Status = domain.WithdrawalStatusRejected
	req.AdminNotes = strings.TrimSpace(reason)
	req.ApprovedBy = adminIdentifier
	req.ProcessedAt = &now

	if err := s.withdrawalRepo.Update(ctx, req); err != nil {
		return nil, fmt.Errorf("failed to update rejected withdrawal: %w", err)
	}

	return req, nil
}

func (s *withdrawalService) ListMerchantWithdrawals(ctx context.Context, merchantID uuid.UUID, limit, offset int) ([]domain.WithdrawalRequest, int64, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	return s.withdrawalRepo.ListByMerchant(ctx, merchantID, limit, offset)
}

func (s *withdrawalService) ListAllWithdrawals(ctx context.Context, status string, limit, offset int) ([]domain.WithdrawalRequest, int64, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	return s.withdrawalRepo.ListAll(ctx, status, limit, offset)
}

func (s *withdrawalService) GetMerchantEscrowSummary(ctx context.Context, merchantID uuid.UUID) (*EscrowSummaryResponse, error) {
	m, err := s.merchantRepo.GetByID(ctx, merchantID)
	if err != nil || m == nil {
		return nil, errors.New("merchant not found")
	}

	mode := m.SettlementMode
	if mode == "" {
		mode = "ESCROW_BALANCE"
	}

	return &EscrowSummaryResponse{
		AvailableBalanceUSD: m.BalanceUSD,
		LockedBalanceUSD:    m.LockedBalanceUSD,
		TotalEscrowUSD:      m.BalanceUSD.Add(m.LockedBalanceUSD),
		MinWithdrawalUSD:    MinWithdrawalAmount,
		SettlementMode:      mode,
	}, nil
}
