package worker_test

import (
	"context"
	"testing"
	"time"

	"github.com/glebarez/sqlite"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"

	"13c-gateway/internal/domain"
	"13c-gateway/internal/worker"
)

func setupPrunerTestDB(t *testing.T) (*gorm.DB, *domain.Merchant) {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite in-memory db: %v", err)
	}

	err = db.AutoMigrate(&domain.Merchant{}, &domain.Invoice{})
	if err != nil {
		t.Fatalf("failed to auto-migrate: %v", err)
	}

	m := &domain.Merchant{
		ID:        uuid.New(),
		Email:     "pruner_test@example.com",
		Name:      "Pruner Merchant",
		APIKey:    "13c_test_pruner_key",
		SecretKey: "sec_12345",
	}
	db.Create(m)

	return db, m
}

func TestPrunerWorker_DryRunAndExecute(t *testing.T) {
	db, m := setupPrunerTestDB(t)
	ctx := context.Background()

	now := time.Now()
	oldTime := now.AddDate(0, 0, -45) // 45 days ago

	// 1. Create an old EXPIRED invoice (should be pruned)
	oldExpiredInv := &domain.Invoice{
		ID:                uuid.New(),
		MerchantID:        m.ID,
		OrderID:           "ORD-OLD-EXPIRED",
		AmountRequested:   decimal.NewFromInt(100),
		CurrencyRequested: "USD",
		PayCurrency:       "USDT",
		PayNetwork:        domain.NetworkBSC,
		PayAmount:         decimal.NewFromInt(100),
		DepositAddress:    "0x1111111111111111111111111111111111111111",
		Status:            domain.StatusExpired,
		ExpiresAt:         oldTime,
		CreatedAt:         oldTime,
	}
	db.Create(oldExpiredInv)

	// 2. Create an old PAID invoice (MUST NEVER be pruned!)
	oldPaidInv := &domain.Invoice{
		ID:                uuid.New(),
		MerchantID:        m.ID,
		OrderID:           "ORD-OLD-PAID",
		AmountRequested:   decimal.NewFromInt(250),
		CurrencyRequested: "USD",
		PayCurrency:       "USDT",
		PayNetwork:        domain.NetworkBSC,
		PayAmount:         decimal.NewFromInt(250),
		DepositAddress:    "0x2222222222222222222222222222222222222222",
		Status:            domain.StatusPaid,
		ExpiresAt:         oldTime,
		CreatedAt:         oldTime,
	}
	db.Create(oldPaidInv)

	// 3. Create a recent EXPIRED invoice (within 30 days retention, should NOT be pruned)
	recentExpiredInv := &domain.Invoice{
		ID:                uuid.New(),
		MerchantID:        m.ID,
		OrderID:           "ORD-RECENT-EXPIRED",
		AmountRequested:   decimal.NewFromInt(50),
		CurrencyRequested: "USD",
		PayCurrency:       "USDT",
		PayNetwork:        domain.NetworkBSC,
		PayAmount:         decimal.NewFromInt(50),
		DepositAddress:    "0x3333333333333333333333333333333333333333",
		Status:            domain.StatusExpired,
		ExpiresAt:         now.AddDate(0, 0, -5), // 5 days ago
		CreatedAt:         now.AddDate(0, 0, -5),
	}
	db.Create(recentExpiredInv)

	pruner := worker.NewPrunerWorker(db)

	// Test Dry-Run (retention: 30 days)
	dryResult, err := pruner.PruneExpiredInvoices(ctx, 30, true)
	if err != nil {
		t.Fatalf("dry run failed: %v", err)
	}
	if dryResult.EligibleCount != 1 {
		t.Fatalf("expected 1 eligible invoice for pruning, got %d", dryResult.EligibleCount)
	}
	if dryResult.PrunedCount != 0 {
		t.Fatalf("expected 0 pruned on dry run, got %d", dryResult.PrunedCount)
	}

	// Test Real Execution (retention: 30 days)
	realResult, err := pruner.PruneExpiredInvoices(ctx, 30, false)
	if err != nil {
		t.Fatalf("real prune failed: %v", err)
	}
	if realResult.PrunedCount != 1 {
		t.Fatalf("expected 1 pruned invoice, got %d", realResult.PrunedCount)
	}

	// Verify old PAID invoice still exists
	var checkPaid domain.Invoice
	if err := db.First(&checkPaid, "id = ?", oldPaidInv.ID).Error; err != nil {
		t.Fatalf("critical error: old PAID invoice was deleted!")
	}

	// Verify recent EXPIRED invoice still exists
	var checkRecent domain.Invoice
	if err := db.First(&checkRecent, "id = ?", recentExpiredInv.ID).Error; err != nil {
		t.Fatalf("recent expired invoice was unexpectedly deleted!")
	}

	// Verify old EXPIRED invoice is gone
	var checkExpired domain.Invoice
	err = db.First(&checkExpired, "id = ?", oldExpiredInv.ID).Error
	if err == nil {
		t.Fatalf("expected old expired invoice to be deleted, but still found")
	}
}
