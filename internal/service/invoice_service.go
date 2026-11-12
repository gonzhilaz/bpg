package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"

	"captain-gateway/internal/crypto"
	"captain-gateway/internal/domain"
	"captain-gateway/internal/repository"
)

// CreateInvoiceRequest defines payload for creating a new invoice
type CreateInvoiceRequest struct {
	OrderID           string          `json:"order_id" binding:"required"`
	Amount            decimal.Decimal `json:"amount" binding:"required"`
	Currency          string          `json:"currency" binding:"required"`      // "USD", "IDR"
	PayCurrency       string          `json:"pay_currency" binding:"required"`  // "USDT", "USDC", "BNB", "SOL"
	PayNetwork        domain.Network  `json:"pay_network" binding:"required"`   // "BSC", "POLYGON", "TRON", "SOLANA"
	CallbackURL       string          `json:"callback_url"`
	CustomExpiryMin   int             `json:"custom_expiry_min"`
}

// InvoiceResponse represents client-facing invoice details
type InvoiceResponse struct {
	ID               uuid.UUID            `json:"id"`
	OrderID          string               `json:"order_id"`
	AmountRequested  decimal.Decimal      `json:"amount_requested"`
	CurrencyRequested string              `json:"currency_requested"`
	PayCurrency      string               `json:"pay_currency"`
	PayNetwork       domain.Network       `json:"pay_network"`
	PayAmount        decimal.Decimal      `json:"pay_amount"`
	DepositAddress   string               `json:"deposit_address"`
	Status           domain.InvoiceStatus `json:"status"`
	ReceivedAmount   decimal.Decimal      `json:"received_amount"`
	RemainingAmount  decimal.Decimal      `json:"remaining_amount"`
	ExpiresAt        time.Time            `json:"expires_at"`
	SecondsRemaining int64                `json:"seconds_remaining"`
	CreatedAt        time.Time            `json:"created_at"`
}

// InvoiceService defines invoice business logic
type InvoiceService interface {
	CreateInvoice(ctx context.Context, merchant *domain.Merchant, req *CreateInvoiceRequest) (*InvoiceResponse, error)
	GetInvoice(ctx context.Context, id uuid.UUID) (*InvoiceResponse, error)
	RecordPayment(ctx context.Context, depositAddress string, amount decimal.Decimal, txHash string, network domain.Network, blockNumber uint64) (*domain.Invoice, error)
}

type invoiceService struct {
	invRepo   repository.InvoiceRepository
	txRepo    repository.TransactionRepository
	rateSvc   RateService
	secretKey string
	expiryMin int
}

// NewInvoiceService creates a new invoice service
func NewInvoiceService(
	invRepo repository.InvoiceRepository,
	txRepo repository.TransactionRepository,
	rateSvc RateService,
	secretKey string,
	expiryMin int,
) InvoiceService {
	return &invoiceService{
		invRepo:   invRepo,
		txRepo:    txRepo,
		rateSvc:   rateSvc,
		secretKey: secretKey,
		expiryMin: expiryMin,
	}
}

func (s *invoiceService) CreateInvoice(ctx context.Context, merchant *domain.Merchant, req *CreateInvoiceRequest) (*InvoiceResponse, error) {
	if merchant == nil {
		return nil, errors.New("merchant is required")
	}

	// 1. Convert requested fiat amount to exact crypto amount
	payAmount, err := s.rateSvc.ConvertToCrypto(ctx, req.Amount, req.Currency, req.PayCurrency)
	if err != nil {
		return nil, fmt.Errorf("failed to calculate crypto rate: %w", err)
	}

	// 2. Resolve merchant destination payout address based on network
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

	// 3. Generate unique deposit address and encrypt private key with AES-256-GCM
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

	invoice := &domain.Invoice{
		MerchantID:        merchant.ID,
		OrderID:           req.OrderID,
		AmountRequested:   req.Amount,
		CurrencyRequested: req.Currency,
		PayCurrency:       req.PayCurrency,
		PayNetwork:        req.PayNetwork,
		PayAmount:         payAmount,
		DepositAddress:    wallet.Address,
		EncryptedPrivKey:  wallet.EncryptedPrivKey,
		Status:            domain.StatusPending,
		ReceivedAmount:    decimal.Zero,
		CallbackURL:       callbackURL,
		PayoutAddress:     payoutAddress,
		ExpiresAt:         expiresAt,
	}

	if err := s.invRepo.Create(ctx, invoice); err != nil {
		return nil, fmt.Errorf("failed to save invoice: %w", err)
	}

	return s.toInvoiceResponse(invoice), nil
}

func (s *invoiceService) GetInvoice(ctx context.Context, id uuid.UUID) (*InvoiceResponse, error) {
	invoice, err := s.invRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if invoice == nil {
		return nil, errors.New("invoice not found")
	}

	// Check if expired
	if invoice.Status == domain.StatusPending && time.Now().After(invoice.ExpiresAt) {
		invoice.Status = domain.StatusExpired
		_ = s.invRepo.Update(ctx, invoice)
	}

	return s.toInvoiceResponse(invoice), nil
}

func (s *invoiceService) RecordPayment(ctx context.Context, depositAddress string, amount decimal.Decimal, txHash string, network domain.Network, blockNumber uint64) (*domain.Invoice, error) {
	invoice, err := s.invRepo.GetByDepositAddress(ctx, depositAddress)
	if err != nil {
		return nil, err
	}
	if invoice == nil {
		return nil, fmt.Errorf("no invoice found for address: %s", depositAddress)
	}

	// Record raw transaction
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
	_ = s.txRepo.Create(ctx, txRecord)

	// Update received amount
	invoice.ReceivedAmount = invoice.ReceivedAmount.Add(amount)

	now := time.Now()
	// Determine status: PAID, UNDERPAID, or OVERPAID
	if invoice.ReceivedAmount.GreaterThanOrEqual(invoice.PayAmount) {
		invoice.Status = domain.StatusPaid
		invoice.PaidAt = &now
	} else {
		invoice.Status = domain.StatusUnderpaid
	}

	if err := s.invRepo.Update(ctx, invoice); err != nil {
		return nil, err
	}

	return invoice, nil
}

func (s *invoiceService) toInvoiceResponse(inv *domain.Invoice) *InvoiceResponse {
	remaining := inv.PayAmount.Sub(inv.ReceivedAmount)
	if remaining.IsNegative() {
		remaining = decimal.Zero
	}

	var secRemaining int64
	if time.Now().Before(inv.ExpiresAt) {
		secRemaining = int64(time.Until(inv.ExpiresAt).Seconds())
	}

	return &InvoiceResponse{
		ID:               inv.ID,
		OrderID:          inv.OrderID,
		AmountRequested:  inv.AmountRequested,
		CurrencyRequested: inv.CurrencyRequested,
		PayCurrency:      inv.PayCurrency,
		PayNetwork:       inv.PayNetwork,
		PayAmount:        inv.PayAmount,
		DepositAddress:   inv.DepositAddress,
		Status:           inv.Status,
		ReceivedAmount:   inv.ReceivedAmount,
		RemainingAmount:  remaining,
		ExpiresAt:        inv.ExpiresAt,
		SecondsRemaining: secRemaining,
		CreatedAt:        inv.CreatedAt,
	}
}
