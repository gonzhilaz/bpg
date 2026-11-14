package service

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"

	"13c-gateway/internal/domain"
)

// CreateInvoiceRequest defines payload for creating a new invoice
type CreateInvoiceRequest struct {
	OrderID            string           `json:"order_id" binding:"required"`
	Amount             decimal.Decimal  `json:"amount" binding:"required"`
	Currency           string           `json:"currency" binding:"required"`     // "USD", "IDR"
	PayCurrency        string           `json:"pay_currency" binding:"required"` // "USDT", "USDC", "BNB", "SOL"
	PayNetwork         domain.Network   `json:"pay_network" binding:"required"`  // "BSC", "POLYGON", "TRON", "SOLANA"
	FeePayer           string           `json:"fee_payer"`                       // "customer" or "merchant"
	CallbackURL        string           `json:"callback_url"`
	CustomExpiryMin    int              `json:"custom_expiry_min"`
	UnderpaidTolerance *decimal.Decimal `json:"underpaid_tolerance"` // Optional margin (0.0 to 100.0)
}

// InvoiceResponse represents client-facing invoice details
type InvoiceResponse struct {
	ID                 uuid.UUID            `json:"id"`
	OrderID            string               `json:"order_id"`
	AmountRequested    decimal.Decimal      `json:"amount_requested"`
	CurrencyRequested  string               `json:"currency_requested"`
	PayCurrency        string               `json:"pay_currency"`
	PayNetwork         domain.Network       `json:"pay_network"`
	PayAmount          decimal.Decimal      `json:"pay_amount"`
	FeePayer           string               `json:"fee_payer"`
	BaseAmount         decimal.Decimal      `json:"base_amount"`
	NetworkFee         decimal.Decimal      `json:"network_fee"`
	DepositAddress     string               `json:"deposit_address"`
	UnderpaidTolerance decimal.Decimal      `json:"underpaid_tolerance"`
	Status             domain.InvoiceStatus `json:"status"`
	ReceivedAmount     decimal.Decimal      `json:"received_amount"`
	RemainingAmount    decimal.Decimal      `json:"remaining_amount"`
	ExpiresAt          time.Time            `json:"expires_at"`
	SecondsRemaining   int64                `json:"seconds_remaining"`
	CreatedAt          time.Time            `json:"created_at"`
}

func formatInvoiceResponse(inv *domain.Invoice) *InvoiceResponse {
	remaining := inv.PayAmount.Sub(inv.ReceivedAmount)
	if remaining.IsNegative() {
		remaining = decimal.Zero
	}

	var secRemaining int64
	if time.Now().Before(inv.ExpiresAt) {
		secRemaining = int64(time.Until(inv.ExpiresAt).Seconds())
	}

	return &InvoiceResponse{
		ID:                 inv.ID,
		OrderID:            inv.OrderID,
		AmountRequested:    inv.AmountRequested,
		CurrencyRequested:  inv.CurrencyRequested,
		PayCurrency:        inv.PayCurrency,
		PayNetwork:         inv.PayNetwork,
		PayAmount:          inv.PayAmount,
		FeePayer:           inv.FeePayer,
		BaseAmount:         inv.BaseAmount,
		NetworkFee:         inv.NetworkFee,
		DepositAddress:     inv.DepositAddress,
		UnderpaidTolerance: inv.UnderpaidTolerance,
		Status:             inv.Status,
		ReceivedAmount:     inv.ReceivedAmount,
		RemainingAmount:    remaining,
		ExpiresAt:          inv.ExpiresAt,
		SecondsRemaining:   secRemaining,
		CreatedAt:          inv.CreatedAt,
	}
}

