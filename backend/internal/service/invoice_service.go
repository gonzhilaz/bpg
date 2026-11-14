package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"

	"13c-gateway/internal/crypto"
	"13c-gateway/internal/domain"
	"13c-gateway/internal/lock"
	"13c-gateway/internal/payout"
	"13c-gateway/internal/repository"
	"13c-gateway/internal/sse"
	"13c-gateway/internal/webhook"
)

// InvoiceService defines invoice business logic
type InvoiceService interface {
	CreateInvoice(ctx context.Context, merchant *domain.Merchant, req *CreateInvoiceRequest) (*InvoiceResponse, error)
	GetInvoice(ctx context.Context, id uuid.UUID) (*InvoiceResponse, error)
	RecordPayment(ctx context.Context, depositAddress string, amount decimal.Decimal, txHash string, network domain.Network, blockNumber uint64) (*domain.Invoice, error)
	SetWithdrawalRepo(repo repository.WithdrawalRepository)
	SetPaymentLinkRepo(repo repository.PaymentLinkRepository)
	SetLockManager(lm lock.LockManager)
	SetUnderpaidTolerance(tolerance decimal.Decimal)
	SetGracePeriod(gracePeriod time.Duration)
}

type invoiceService struct {
	invRepo            repository.InvoiceRepository
	txRepo             repository.TransactionRepository
	withdrawalRepo     repository.WithdrawalRepository
	paymentLinkRepo    repository.PaymentLinkRepository
	lockMgr            lock.LockManager
	rateSvc            RateService
	payoutSvc          payout.PayoutService
	dispatcher         webhook.Dispatcher
	secretKey          string
	expiryMin          int
	underpaidTolerance decimal.Decimal
	gracePeriod        time.Duration
}

// NewInvoiceService creates a new invoice service with payout, webhook, and distributed lock integration
func NewInvoiceService(
	invRepo repository.InvoiceRepository,
	txRepo repository.TransactionRepository,
	rateSvc RateService,
	payoutSvc payout.PayoutService,
	dispatcher webhook.Dispatcher,
	secretKey string,
	expiryMin int,
) InvoiceService {
	return &invoiceService{
		invRepo:            invRepo,
		txRepo:             txRepo,
		lockMgr:            lock.GetDefaultLockManager(),
		rateSvc:            rateSvc,
		payoutSvc:          payoutSvc,
		dispatcher:         dispatcher,
		secretKey:          secretKey,
		expiryMin:          expiryMin,
		underpaidTolerance: decimal.Zero,
		gracePeriod:        15 * time.Minute,
	}
}

func (s *invoiceService) SetWithdrawalRepo(repo repository.WithdrawalRepository) {
	s.withdrawalRepo = repo
}

func (s *invoiceService) SetPaymentLinkRepo(repo repository.PaymentLinkRepository) {
	s.paymentLinkRepo = repo
}

func (s *invoiceService) SetLockManager(lm lock.LockManager) {
	s.lockMgr = lm
}

func (s *invoiceService) SetUnderpaidTolerance(tolerance decimal.Decimal) {
	if tolerance.IsNegative() {
		tolerance = decimal.Zero
	} else if tolerance.GreaterThan(decimal.NewFromInt(100)) {
		tolerance = decimal.NewFromInt(100)
	}
	s.underpaidTolerance = tolerance
}

func (s *invoiceService) SetGracePeriod(gracePeriod time.Duration) {
	if gracePeriod < 0 {
		gracePeriod = 0
	}
	s.gracePeriod = gracePeriod
}

func (s *invoiceService) CreateInvoice(ctx context.Context, merchant *domain.Merchant, req *CreateInvoiceRequest) (*InvoiceResponse, error) {
	if merchant == nil {
		return nil, errors.New("merchant is required")
	}

	payAmount, err := s.rateSvc.ConvertToCrypto(ctx, req.Amount, req.Currency, req.PayCurrency)
	if err != nil {
		return nil, fmt.Errorf("failed to calculate crypto rate: %w", err)
	}

	feePayer := strings.ToLower(strings.TrimSpace(req.FeePayer))
	if feePayer != "merchant" {
		feePayer = "customer"
	}

	var networkFee decimal.Decimal
	switch req.PayNetwork {
	case domain.NetworkBSC:
		networkFee = decimal.NewFromFloat(0.05)
	case domain.NetworkPolygon:
		networkFee = decimal.NewFromFloat(0.02)
	case domain.NetworkTron:
		networkFee = decimal.NewFromFloat(1.20)
	case domain.NetworkSolana:
		networkFee = decimal.NewFromFloat(0.01)
	default:
		networkFee = decimal.Zero
	}

	baseAmount := payAmount
	if feePayer == "customer" {
		payAmount = baseAmount.Add(networkFee)
	}

	var payoutAddress string
	switch req.PayNetwork {
	case domain.NetworkBSC:
		payoutAddress = merchant.PayoutAddressBSC
	case domain.NetworkPolygon:
		payoutAddress = merchant.PayoutAddressPolygon
	case domain.NetworkTron:
		payoutAddress = merchant.PayoutAddressTron
	case domain.NetworkSolana:
		payoutAddress = merchant.PayoutAddressSolana
	default:
		return nil, fmt.Errorf("unsupported network: %s", req.PayNetwork)
	}

	wallet, err := crypto.GenerateDepositWallet(req.PayNetwork, s.secretKey)
	if err != nil {
		return nil, fmt.Errorf("failed to generate deposit wallet: %w", err)
	}

	expiryMinutes := s.expiryMin
	if req.CustomExpiryMin > 0 {
		expiryMinutes = req.CustomExpiryMin
	}
	expiresAt := time.Now().Add(time.Duration(expiryMinutes) * time.Minute)

	callbackURL := req.CallbackURL
	if callbackURL == "" {
		callbackURL = merchant.WebhookURL
	}

	tolerance := s.underpaidTolerance
	if merchant.UnderpaidTolerance.GreaterThan(decimal.Zero) {
		tolerance = merchant.UnderpaidTolerance
	}
	if req.UnderpaidTolerance != nil {
		if req.UnderpaidTolerance.IsNegative() || req.UnderpaidTolerance.GreaterThan(decimal.NewFromInt(100)) {
			return nil, errors.New("underpaid_tolerance must be between 0.0 and 100.0 percent")
		}
		tolerance = *req.UnderpaidTolerance
	}

	invoice := &domain.Invoice{
		MerchantID:         merchant.ID,
		OrderID:            req.OrderID,
		AmountRequested:    req.Amount,
		CurrencyRequested:  req.Currency,
		PayCurrency:        req.PayCurrency,
		PayNetwork:         req.PayNetwork,
		PayAmount:          payAmount,
		FeePayer:           feePayer,
		BaseAmount:         baseAmount,
		NetworkFee:         networkFee,
		DepositAddress:     wallet.Address,
		EncryptedPrivKey:   wallet.EncryptedPrivKey,
		UnderpaidTolerance: tolerance,
		Status:             domain.StatusPending,
		ReceivedAmount:     decimal.Zero,
		CallbackURL:        callbackURL,
		PayoutAddress:      payoutAddress,
		ExpiresAt:          expiresAt,
	}

	if err := s.invRepo.Create(ctx, invoice); err != nil {
		return nil, fmt.Errorf("failed to save invoice: %w", err)
	}

	return formatInvoiceResponse(invoice), nil
}

func (s *invoiceService) GetInvoice(ctx context.Context, id uuid.UUID) (*InvoiceResponse, error) {
	invoice, err := s.invRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if invoice == nil {
		return nil, errors.New("invoice not found")
	}

	effectiveExpiry := invoice.ExpiresAt.Add(s.gracePeriod)
	if invoice.Status == domain.StatusPending && time.Now().After(effectiveExpiry) {
		invoice.Status = domain.StatusExpired
		_ = s.invRepo.Update(ctx, invoice)
	}

	return formatInvoiceResponse(invoice), nil
}

func (s *invoiceService) RecordPayment(ctx context.Context, depositAddress string, amount decimal.Decimal, txHash string, network domain.Network, blockNumber uint64) (*domain.Invoice, error) {
	// 1. Acquire distributed concurrency lock for this deposit address (anti-race condition)
	if s.lockMgr != nil {
		unlock, err := s.lockMgr.Acquire(ctx, "lock:deposit:"+depositAddress, 10*time.Second)
		if err != nil {
			return nil, fmt.Errorf("concurrency lock failed for address %s: %w", depositAddress, err)
		}
		defer unlock()
	}

	// 2. Check Idempotency: skip duplicate event if txHash was already processed
	existingTx, _ := s.txRepo.GetByTxHash(ctx, txHash)
	if existingTx != nil {
		log.Printf("[RECORD PAYMENT IDEMPOTENT] Tx %s already processed, skipping duplicate event", txHash)
		return s.invRepo.GetByDepositAddress(ctx, depositAddress)
	}

	invoice, err := s.invRepo.GetByDepositAddress(ctx, depositAddress)
	if err != nil {
		return nil, err
	}
	if invoice == nil {
		return nil, fmt.Errorf("no invoice found for address: %s", depositAddress)
	}

	txRecord := &domain.BlockchainTransaction{
		InvoiceID:     invoice.ID,
		Network:       network,
		TxHash:        txHash,
		FromAddress:   "external",
		ToAddress:     depositAddress,
		Amount:        amount,
		TokenSymbol:   invoice.PayCurrency,
		BlockNumber:   blockNumber,
		Confirmations: 1,
		Status:        domain.TxStatusConfirmed,
	}

	if err := s.txRepo.Create(ctx, txRecord); err != nil {
		return invoice, fmt.Errorf("transaction %s already processed or duplicate: %w", txHash, err)
	}

	invoice.ReceivedAmount = invoice.ReceivedAmount.Add(amount)

	tolerance := invoice.UnderpaidTolerance
	if tolerance.IsNegative() {
		tolerance = decimal.Zero
	} else if tolerance.GreaterThan(decimal.NewFromInt(100)) {
		tolerance = decimal.NewFromInt(100)
	}

	minRequired := invoice.PayAmount
	if tolerance.GreaterThan(decimal.Zero) {
		factor := decimal.NewFromInt(1).Sub(tolerance.Div(decimal.NewFromInt(100)))
		minRequired = invoice.PayAmount.Mul(factor)
	}

	now := time.Now()
	var eventName string
	if invoice.ReceivedAmount.GreaterThanOrEqual(minRequired) {
		invoice.Status = domain.StatusPaid
		invoice.PaidAt = &now
		eventName = "invoice.paid"
	} else {
		invoice.Status = domain.StatusUnderpaid
		eventName = "invoice.underpaid"
	}

	if err := s.invRepo.Update(ctx, invoice); err != nil {
		return nil, err
	}

	// Settlement: Instant Forward or Escrow Balance
	if invoice.Status == domain.StatusPaid && invoice.Merchant != nil {
		if invoice.Merchant.SettlementMode == "INSTANT_FORWARD" {
			if s.payoutSvc != nil {
				go func(inv *domain.Invoice) {
					pCtx, pCancel := context.WithTimeout(context.Background(), 2*time.Minute)
					defer pCancel()
					_, _ = s.payoutSvc.ProcessAutoPayout(pCtx, inv)
				}(invoice)
			}
		} else {
			if s.withdrawalRepo != nil {
				_ = s.withdrawalRepo.CreditEscrowBalance(ctx, invoice.Merchant.ID, invoice.PayAmount)
			}
		}

		if strings.HasPrefix(invoice.OrderID, "LINK-") && s.paymentLinkRepo != nil {
			parts := strings.Split(invoice.OrderID, "-")
			if len(parts) >= 2 {
				slug := parts[1]
				_ = s.paymentLinkRepo.RecordPaymentBySlug(ctx, slug, invoice.PayAmount)
			}
		}
	}

	if s.dispatcher != nil && invoice.Merchant != nil {
		s.dispatcher.DispatchInvoiceEvent(ctx, invoice, invoice.Merchant.SecretKey, eventName)
	}

	sse.GetHub().Broadcast(invoice.ID.String(), sse.InvoiceEvent{
		Event:          string(invoice.Status),
		InvoiceID:      invoice.ID.String(),
		Status:         string(invoice.Status),
		ReceivedAmount: invoice.ReceivedAmount.String(),
		PayAmount:      invoice.PayAmount.String(),
		TxHash:         txHash,
	})

	return invoice, nil
}
