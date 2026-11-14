package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/glebarez/sqlite"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"

	"13c-gateway/internal/domain"
	"13c-gateway/internal/repository"
	"13c-gateway/internal/service"
)

func setupTestDB(t *testing.T) (*gorm.DB, repository.InvoiceRepository, repository.TransactionRepository, *domain.Merchant) {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open in-memory db: %v", err)
	}

	err = db.AutoMigrate(
		&domain.Merchant{},
		&domain.Invoice{},
		&domain.BlockchainTransaction{},
		&domain.PayoutTransfer{},
		&domain.WithdrawalRequest{},
		&domain.PaymentLink{},
	)
	if err != nil {
		t.Fatalf("failed to auto migrate: %v", err)
	}

	id := uuid.New()
	merchant := &domain.Merchant{
		ID:                 id,
		Email:              "merchant_" + id.String()[:8] + "@test.com",
		Name:               "Test Store",
		APIKey:             "13c_live_" + id.String()[:12],
		SecretKey:          "sec_1234567890abcdef",
		SettlementMode:     "ESCROW_BALANCE",
		UnderpaidTolerance: decimal.Zero,
	}
	db.Create(merchant)

	invRepo := repository.NewInvoiceRepository(db)
	txRepo := repository.NewTransactionRepository(db)

	return db, invRepo, txRepo, merchant
}

func TestUnderpaidTolerance_DefaultZeroPercent(t *testing.T) {
	_, invRepo, txRepo, merchant := setupTestDB(t)

	svc := service.NewInvoiceService(
		invRepo,
		txRepo,
		service.NewRateService(),
		nil,
		nil,
		"test-encryption-key-32bytes-long!",
		30,
	)
	// Default tolerance is 0%
	svc.SetUnderpaidTolerance(decimal.Zero)

	ctx := context.Background()
	req := &service.CreateInvoiceRequest{
		OrderID:     "ORD-001",
		Amount:      decimal.NewFromInt(100),
		Currency:    "USD",
		PayCurrency: "USDT",
		PayNetwork:  domain.NetworkBSC,
		FeePayer:    "customer",
	}

	invResp, err := svc.CreateInvoice(ctx, merchant, req)
	if err != nil {
		t.Fatalf("failed to create invoice: %v", err)
	}

	// Pay slightly less: 99.90 USDT on 100.05 USDT invoice (including fee)
	payAmount := invResp.PayAmount
	underpaidAmount := payAmount.Sub(decimal.NewFromFloat(0.10))

	inv, err := svc.RecordPayment(ctx, invResp.DepositAddress, underpaidAmount, "0xtest_tx_1", domain.NetworkBSC, 1000)
	if err != nil {
		t.Fatalf("record payment failed: %v", err)
	}

	// With 0% tolerance, must be UNDERPAID
	if inv.Status != domain.StatusUnderpaid {
		t.Fatalf("expected StatusUnderpaid with 0%% tolerance, got: %s", inv.Status)
	}

	// Pay the remaining 0.10 USDT
	inv2, err := svc.RecordPayment(ctx, invResp.DepositAddress, decimal.NewFromFloat(0.10), "0xtest_tx_2", domain.NetworkBSC, 1001)
	if err != nil {
		t.Fatalf("record payment 2 failed: %v", err)
	}

	// Now total matches exactly -> PAID
	if inv2.Status != domain.StatusPaid {
		t.Fatalf("expected StatusPaid after full payment, got: %s", inv2.Status)
	}
}

func TestUnderpaidTolerance_ConfiguredPercent(t *testing.T) {
	_, invRepo, txRepo, merchant := setupTestDB(t)

	svc := service.NewInvoiceService(
		invRepo,
		txRepo,
		service.NewRateService(),
		nil,
		nil,
		"test-encryption-key-32bytes-long!",
		30,
	)

	ctx := context.Background()
	// Set 2.0% tolerance on invoice
	tol2Percent := decimal.NewFromFloat(2.0)
	req := &service.CreateInvoiceRequest{
		OrderID:            "ORD-002",
		Amount:             decimal.NewFromInt(100),
		Currency:           "USD",
		PayCurrency:        "USDT",
		PayNetwork:         domain.NetworkPolygon,
		FeePayer:           "merchant",
		UnderpaidTolerance: &tol2Percent,
	}

	invResp, err := svc.CreateInvoice(ctx, merchant, req)
	if err != nil {
		t.Fatalf("failed to create invoice: %v", err)
	}

	// 100 USDT with 2% tolerance requires at least 98.00 USDT
	// Pay 98.50 USDT (which is >= 98.00 USDT)
	inv, err := svc.RecordPayment(ctx, invResp.DepositAddress, decimal.NewFromFloat(98.50), "0xtest_tx_poly_1", domain.NetworkPolygon, 2000)
	if err != nil {
		t.Fatalf("record payment failed: %v", err)
	}

	if inv.Status != domain.StatusPaid {
		t.Fatalf("expected StatusPaid with 2%% tolerance for 98.50/100, got: %s", inv.Status)
	}
}

func TestUnderpaidTolerance_RangeValidation(t *testing.T) {
	_, invRepo, txRepo, merchant := setupTestDB(t)

	svc := service.NewInvoiceService(
		invRepo,
		txRepo,
		service.NewRateService(),
		nil,
		nil,
		"test-encryption-key-32bytes-long!",
		30,
	)

	ctx := context.Background()

	// 1. Negative tolerance must be rejected
	negTol := decimal.NewFromFloat(-1.0)
	req1 := &service.CreateInvoiceRequest{
		OrderID:            "ORD-003",
		Amount:             decimal.NewFromInt(50),
		Currency:           "USD",
		PayCurrency:        "USDT",
		PayNetwork:         domain.NetworkBSC,
		UnderpaidTolerance: &negTol,
	}
	_, err := svc.CreateInvoice(ctx, merchant, req1)
	if err == nil {
		t.Fatalf("expected error for negative tolerance, got nil")
	}

	// 2. Tolerance > 100% must be rejected
	overTol := decimal.NewFromFloat(105.0)
	req2 := &service.CreateInvoiceRequest{
		OrderID:            "ORD-004",
		Amount:             decimal.NewFromInt(50),
		Currency:           "USD",
		PayCurrency:        "USDT",
		PayNetwork:         domain.NetworkBSC,
		UnderpaidTolerance: &overTol,
	}
	_, err = svc.CreateInvoice(ctx, merchant, req2)
	if err == nil {
		t.Fatalf("expected error for tolerance > 100%%, got nil")
	}
}

func TestGracePeriod_GetInvoiceActiveDuringGrace(t *testing.T) {
	db, invRepo, txRepo, merchant := setupTestDB(t)

	svc := service.NewInvoiceService(
		invRepo,
		txRepo,
		service.NewRateService(),
		nil,
		nil,
		"test-encryption-key-32bytes-long!",
		1, // 1 min expiry
	)
	// Grace period: 15 minutes
	svc.SetGracePeriod(15 * time.Minute)

	ctx := context.Background()
	req := &service.CreateInvoiceRequest{
		OrderID:     "ORD-005",
		Amount:      decimal.NewFromInt(25),
		Currency:    "USD",
		PayCurrency: "USDT",
		PayNetwork:  domain.NetworkBSC,
		FeePayer:    "merchant",
	}

	invResp, err := svc.CreateInvoice(ctx, merchant, req)
	if err != nil {
		t.Fatalf("failed to create invoice: %v", err)
	}

	// Fast-forward ExpiresAt to 5 minutes ago (so it is past normal expiry, but within 15m grace)
	pastExpiry := time.Now().Add(-5 * time.Minute)
	db.Model(&domain.Invoice{}).Where("id = ?", invResp.ID).Update("expires_at", pastExpiry)

	// Fetch invoice: should still be PENDING because it's inside 15 min grace period
	fetched, err := svc.GetInvoice(ctx, invResp.ID)
	if err != nil {
		t.Fatalf("failed to get invoice: %v", err)
	}

	if fetched.Status != domain.StatusPending {
		t.Fatalf("expected StatusPending during grace period, got: %s", fetched.Status)
	}

	// Fast-forward ExpiresAt to 20 minutes ago (past both normal expiry and 15m grace)
	veryPastExpiry := time.Now().Add(-20 * time.Minute)
	db.Model(&domain.Invoice{}).Where("id = ?", invResp.ID).Update("expires_at", veryPastExpiry)

	// Fetch invoice: now it MUST be EXPIRED
	fetchedAfterGrace, err := svc.GetInvoice(ctx, invResp.ID)
	if err != nil {
		t.Fatalf("failed to get invoice after grace: %v", err)
	}

	if fetchedAfterGrace.Status != domain.StatusExpired {
		t.Fatalf("expected StatusExpired after grace period elapsed, got: %s", fetchedAfterGrace.Status)
	}
}

func TestPaymentLink_MetricsIncrementOnInvoicePaid(t *testing.T) {
	db, invRepo, txRepo, merchant := setupTestDB(t)

	linkRepo := repository.NewPaymentLinkRepository(db)
	svc := service.NewInvoiceService(
		invRepo,
		txRepo,
		service.NewRateService(),
		nil,
		nil,
		"test_sec",
		15,
	)
	svc.SetPaymentLinkRepo(linkRepo)

	ctx := context.Background()

	// 1. Create a PaymentLink
	slug := "pl_testmetric"
	amt := decimal.NewFromInt(50)
	pl := &domain.PaymentLink{
		MerchantID:     merchant.ID,
		Slug:           slug,
		Title:          "VIP Pass",
		Amount:         &amt,
		Currency:       "USD",
		PayNetwork:     domain.NetworkBSC,
		IsActive:       true,
		TotalCollected: decimal.Zero,
		PaymentCount:   0,
	}
	if err := linkRepo.Create(ctx, pl); err != nil {
		t.Fatalf("failed to create link: %v", err)
	}

	// 2. Create invoice simulating Payment Link checkout (OrderID: LINK-pl_testmetric-123456)
	invReq := &service.CreateInvoiceRequest{
		OrderID:     "LINK-" + slug + "-123456",
		Amount:      amt,
		Currency:    "USD",
		PayCurrency: "USDT",
		PayNetwork:  domain.NetworkBSC,
	}
	invResp, err := svc.CreateInvoice(ctx, merchant, invReq)
	if err != nil {
		t.Fatalf("failed to create invoice: %v", err)
	}

	// 3. Simulate payment on deposit address with exact PayAmount
	paidInv, err := svc.RecordPayment(ctx, invResp.DepositAddress, invResp.PayAmount, "0xtxhash_link_test", domain.NetworkBSC, 1000)
	if err != nil {
		t.Fatalf("failed to record payment: %v", err)
	}
	if paidInv.Status != domain.StatusPaid {
		t.Fatalf("expected invoice status PAID, got: %s", paidInv.Status)
	}

	// 4. Verify PaymentLink metrics are updated
	updatedLink, err := linkRepo.GetBySlug(ctx, slug)
	if err != nil {
		t.Fatalf("failed to get updated link: %v", err)
	}
	if updatedLink.PaymentCount != 1 {
		t.Fatalf("expected payment_count 1, got: %d", updatedLink.PaymentCount)
	}
	if !updatedLink.TotalCollected.Equal(invResp.PayAmount) {
		t.Fatalf("expected total_collected %s, got: %s", invResp.PayAmount.String(), updatedLink.TotalCollected.String())
	}
}
