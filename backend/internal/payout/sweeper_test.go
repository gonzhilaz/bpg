package payout

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"

	"13c-gateway/internal/crypto"
	"13c-gateway/internal/domain"
)

type mockPayoutRepo struct {
	createdRecords []*domain.PayoutTransfer
}

func (m *mockPayoutRepo) Create(ctx context.Context, transfer *domain.PayoutTransfer) error {
	m.createdRecords = append(m.createdRecords, transfer)
	return nil
}

func (m *mockPayoutRepo) GetByID(ctx context.Context, id uuid.UUID) (*domain.PayoutTransfer, error) {
	return nil, nil
}

func (m *mockPayoutRepo) GetByInvoiceID(ctx context.Context, invoiceID uuid.UUID) ([]domain.PayoutTransfer, error) {
	return nil, nil
}

func (m *mockPayoutRepo) Update(ctx context.Context, payout *domain.PayoutTransfer) error {
	return nil
}

func TestSweeper_SimulateSweep_DustProtection(t *testing.T) {
	repo := &mockPayoutRepo{}
	sweeper := NewBatchSweeper(repo, nil, "12345678901234567890123456789012", "0xMasterHotWallet")

	// Case 1: Dust balance (0.5 USDT on BSC, where min is 1.0 USDT)
	invDust := &domain.Invoice{
		ID:             uuid.New(),
		PayNetwork:     domain.NetworkBSC,
		PayCurrency:    "USDT",
		ReceivedAmount: decimal.NewFromFloat(0.50),
	}
	canSweep, _, reason := sweeper.SimulateSweep(invDust)
	if canSweep {
		t.Fatalf("expected dust balance 0.50 to be rejected, but simulation passed")
	}
	if reason == "" {
		t.Fatal("expected reason for dust rejection")
	}

	// Case 2: Sufficient balance (50.0 USDT on BSC)
	invSufficient := &domain.Invoice{
		ID:             uuid.New(),
		PayNetwork:     domain.NetworkBSC,
		PayCurrency:    "USDT",
		ReceivedAmount: decimal.NewFromFloat(50.00),
	}
	canSweepSufficient, estFee, _ := sweeper.SimulateSweep(invSufficient)
	if !canSweepSufficient {
		t.Fatalf("expected 50.00 USDT balance to pass sweep simulation, but it was rejected")
	}
	if estFee.LessThanOrEqual(decimal.Zero) {
		t.Fatalf("expected positive estimated gas fee, got %s", estFee)
	}

	// Case 3: TRON Network with higher dust limit (1.5 USDT, where TRON min is 2.0 USDT)
	invTronDust := &domain.Invoice{
		ID:             uuid.New(),
		PayNetwork:     domain.NetworkTron,
		PayCurrency:    "USDT",
		ReceivedAmount: decimal.NewFromFloat(1.50),
	}
	canSweepTron, _, _ := sweeper.SimulateSweep(invTronDust)
	if canSweepTron {
		t.Fatalf("expected TRON 1.50 USDT to be rejected by 2.0 USDT threshold, but it passed")
	}
}

func TestSweeper_SweepInvoice_DustReturnsErr(t *testing.T) {
	repo := &mockPayoutRepo{}
	sweeper := NewBatchSweeper(repo, nil, "12345678901234567890123456789012", "0xMasterHotWallet")

	inv := &domain.Invoice{
		ID:             uuid.New(),
		PayNetwork:     domain.NetworkPolygon,
		PayCurrency:    "USDT",
		ReceivedAmount: decimal.NewFromFloat(0.01), // extreme dust
	}

	err := sweeper.SweepInvoice(context.Background(), inv)
	if !errors.Is(err, ErrDustBalance) {
		t.Fatalf("expected ErrDustBalance for dust sweep, got %v", err)
	}
	if len(repo.createdRecords) != 0 {
		t.Fatalf("expected 0 sweep records for dust, got %d", len(repo.createdRecords))
	}
}

func TestSweeper_SweepInvoice_Success(t *testing.T) {
	secretKey := "12345678901234567890123456789012"
	encPrivKey, err := crypto.EncryptAESGCM("c4bb2524419fb7b6...", secretKey)
	if err != nil {
		t.Fatalf("failed to encrypt fake private key: %v", err)
	}

	repo := &mockPayoutRepo{}
	sweeper := NewBatchSweeper(repo, nil, secretKey, "0xMasterHotWalletAddress123")

	inv := &domain.Invoice{
		ID:                uuid.New(),
		PayNetwork:        domain.NetworkBSC,
		PayCurrency:       "USDT",
		DepositAddress:    "0xEphemeralDepositAddress",
		ReceivedAmount:    decimal.NewFromFloat(250.00),
		EncryptedPrivKey:  encPrivKey,
	}

	err = sweeper.SweepInvoice(context.Background(), inv)
	if err != nil {
		t.Fatalf("unexpected error during sweep: %v", err)
	}

	if len(repo.createdRecords) != 1 {
		t.Fatalf("expected 1 sweep record created, got %d", len(repo.createdRecords))
	}

	rec := repo.createdRecords[0]
	if rec.RecipientAddress != "0xMasterHotWalletAddress123" {
		t.Fatalf("expected hot wallet recipient, got %s", rec.RecipientAddress)
	}
	if !rec.AmountSent.Equal(decimal.NewFromFloat(250.00)) {
		t.Fatalf("expected amount 250.00, got %s", rec.AmountSent)
	}
	if rec.NetworkFeePaid.LessThanOrEqual(decimal.Zero) {
		t.Fatalf("expected positive network fee, got %s", rec.NetworkFeePaid)
	}
}
