package service_test

import (
	"context"
	"testing"

	"github.com/glebarez/sqlite"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"

	"13c-gateway/internal/domain"
	"13c-gateway/internal/repository"
	"13c-gateway/internal/service"
)

func setupWithdrawalTest(t *testing.T) (*gorm.DB, service.WithdrawalService, repository.MerchantRepository, *domain.Merchant) {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open in-memory db: %v", err)
	}

	err = db.AutoMigrate(
		&domain.Merchant{},
		&domain.WithdrawalRequest{},
	)
	if err != nil {
		t.Fatalf("failed to auto migrate: %v", err)
	}

	id := uuid.New()
	merchant := &domain.Merchant{
		ID:               id,
		Email:            "escrow_" + id.String()[:8] + "@test.com",
		Name:             "Escrow Test Merchant",
		APIKey:           "13c_live_" + id.String()[:12],
		SecretKey:        "sec_test_secret_12345",
		SettlementMode:   "ESCROW_BALANCE",
		BalanceUSD:       decimal.NewFromFloat(500.00),
		LockedBalanceUSD: decimal.Zero,
	}
	db.Create(merchant)

	withdrawalRepo := repository.NewWithdrawalRepository(db)
	merchantRepo := repository.NewMerchantRepository(db)
	svc := service.NewWithdrawalService(withdrawalRepo, merchantRepo)

	return db, svc, merchantRepo, merchant
}

func TestWithdrawal_MinimumThreshold(t *testing.T) {
	_, svc, _, merchant := setupWithdrawalTest(t)
	ctx := context.Background()

	// Request $49.99 (below minimum $50.00)
	smallAmount := decimal.NewFromFloat(49.99)
	_, err := svc.RequestWithdrawal(ctx, merchant.ID, smallAmount, domain.NetworkBSC, "0x1234567890123456789012345678901234567890")
	if err == nil {
		t.Fatalf("expected error for amount < $50.00, got nil")
	}
}

func TestWithdrawal_InsufficientBalance(t *testing.T) {
	_, svc, _, merchant := setupWithdrawalTest(t)
	ctx := context.Background()

	// Request $600 (merchant only has $500)
	excessiveAmount := decimal.NewFromFloat(600.00)
	_, err := svc.RequestWithdrawal(ctx, merchant.ID, excessiveAmount, domain.NetworkPolygon, "0x1234567890123456789012345678901234567890")
	if err == nil {
		t.Fatalf("expected error for insufficient balance, got nil")
	}
}

func TestWithdrawal_RequestAndApprove(t *testing.T) {
	_, svc, merchantRepo, merchant := setupWithdrawalTest(t)
	ctx := context.Background()

	// Request $150.00 withdrawal
	amount := decimal.NewFromFloat(150.00)
	req, err := svc.RequestWithdrawal(ctx, merchant.ID, amount, domain.NetworkTron, "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa")
	if err != nil {
		t.Fatalf("failed to request withdrawal: %v", err)
	}

	if req.Status != domain.WithdrawalStatusPending {
		t.Fatalf("expected status PENDING, got %s", req.Status)
	}

	// Verify balance locked ($500 - $150 = $350 available, $150 locked)
	updatedM, err := merchantRepo.GetByID(ctx, merchant.ID)
	if err != nil {
		t.Fatalf("failed to fetch updated merchant: %v", err)
	}
	if !updatedM.BalanceUSD.Equal(decimal.NewFromFloat(350.00)) {
		t.Fatalf("expected available balance 350.00, got %s", updatedM.BalanceUSD.String())
	}
	if !updatedM.LockedBalanceUSD.Equal(decimal.NewFromFloat(150.00)) {
		t.Fatalf("expected locked balance 150.00, got %s", updatedM.LockedBalanceUSD.String())
	}

	// Admin approves
	approvedReq, err := svc.ApproveWithdrawal(ctx, req.ID, "admin@13c.dev")
	if err != nil {
		t.Fatalf("failed to approve withdrawal: %v", err)
	}

	if approvedReq.Status != domain.WithdrawalStatusCompleted {
		t.Fatalf("expected status COMPLETED, got %s", approvedReq.Status)
	}
	if approvedReq.TxHash == "" {
		t.Fatalf("expected non-empty TxHash on approval")
	}

	// Verify locked balance finalized ($0 locked, $350 available)
	finalM, _ := merchantRepo.GetByID(ctx, merchant.ID)
	if !finalM.LockedBalanceUSD.Equal(decimal.Zero) {
		t.Fatalf("expected locked balance 0, got %s", finalM.LockedBalanceUSD.String())
	}
	if !finalM.BalanceUSD.Equal(decimal.NewFromFloat(350.00)) {
		t.Fatalf("expected available balance 350.00, got %s", finalM.BalanceUSD.String())
	}
}

func TestWithdrawal_RequestAndReject(t *testing.T) {
	_, svc, merchantRepo, merchant := setupWithdrawalTest(t)
	ctx := context.Background()

	// Request $200.00 withdrawal
	amount := decimal.NewFromFloat(200.00)
	req, err := svc.RequestWithdrawal(ctx, merchant.ID, amount, domain.NetworkSolana, "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU")
	if err != nil {
		t.Fatalf("failed to request withdrawal: %v", err)
	}

	// Admin rejects
	rejectedReq, err := svc.RejectWithdrawal(ctx, req.ID, "admin@13c.dev", "KYC Verification required")
	if err != nil {
		t.Fatalf("failed to reject withdrawal: %v", err)
	}

	if rejectedReq.Status != domain.WithdrawalStatusRejected {
		t.Fatalf("expected status REJECTED, got %s", rejectedReq.Status)
	}
	if rejectedReq.AdminNotes != "KYC Verification required" {
		t.Fatalf("expected admin notes match reason, got '%s'", rejectedReq.AdminNotes)
	}

	// Verify balance refunded back to available ($500 available, $0 locked)
	refundedM, _ := merchantRepo.GetByID(ctx, merchant.ID)
	if !refundedM.BalanceUSD.Equal(decimal.NewFromFloat(500.00)) {
		t.Fatalf("expected available balance restored to 500.00, got %s", refundedM.BalanceUSD.String())
	}
	if !refundedM.LockedBalanceUSD.Equal(decimal.Zero) {
		t.Fatalf("expected locked balance restored to 0, got %s", refundedM.LockedBalanceUSD.String())
	}
}

func TestWithdrawal_EscrowSummary(t *testing.T) {
	_, svc, _, merchant := setupWithdrawalTest(t)
	ctx := context.Background()

	summary, err := svc.GetMerchantEscrowSummary(ctx, merchant.ID)
	if err != nil {
		t.Fatalf("failed to get escrow summary: %v", err)
	}

	if !summary.AvailableBalanceUSD.Equal(decimal.NewFromFloat(500.00)) {
		t.Fatalf("expected available 500, got %s", summary.AvailableBalanceUSD.String())
	}
	if !summary.MinWithdrawalUSD.Equal(decimal.NewFromFloat(50.00)) {
		t.Fatalf("expected min withdrawal 50, got %s", summary.MinWithdrawalUSD.String())
	}
}
