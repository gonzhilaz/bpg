package service_test

import (
	"context"
	"testing"

	"github.com/shopspring/decimal"

	"13c-gateway/internal/domain"
	"13c-gateway/internal/payout"
	"13c-gateway/internal/repository"
	"13c-gateway/internal/service"
)

func TestRecordPayment_OverpaymentDeltaCrediting(t *testing.T) {
	db, invRepo, txRepo, merchant := setupTestDB(t)
	merchant.SettlementMode = "ESCROW"
	merchant.BalanceUSD = decimal.Zero
	db.Save(merchant)

	rateSvc := service.NewRateService()
	payoutRepo := repository.NewPayoutRepository(db)
	payoutSvc := payout.NewPayoutService(payoutRepo)
	withdrawalRepo := repository.NewWithdrawalRepository(db)

	svc := service.NewInvoiceService(
		invRepo,
		txRepo,
		rateSvc,
		payoutSvc,
		nil,
		"test-encryption-key-32bytes-long!",
		30,
	)
	svc.SetWithdrawalRepo(withdrawalRepo)

	ctx := context.Background()

	// 1. Create $100 invoice
	invResp, err := svc.CreateInvoice(ctx, merchant, &service.CreateInvoiceRequest{
		OrderID:     "ORD-OVERPAY-100",
		Amount:      decimal.NewFromFloat(100.0),
		Currency:    "USD",
		PayCurrency: "USDT",
		PayNetwork:  domain.NetworkBSC,
	})
	if err != nil {
		t.Fatalf("failed to create invoice: %v", err)
	}

	// 2. Pay $100 exactly
	inv1, err := svc.RecordPayment(ctx, invResp.DepositAddress, invResp.PayAmount, "0xinitial_paid_tx", domain.NetworkBSC, 1000)
	if err != nil {
		t.Fatalf("initial payment failed: %v", err)
	}
	if inv1.Status != domain.StatusPaid {
		t.Fatalf("expected status PAID, got %s", inv1.Status)
	}

	// Check merchant escrow balance
	var m domain.Merchant
	db.First(&m, "id = ?", merchant.ID)
	if !m.BalanceUSD.Equal(invResp.PayAmount) {
		t.Fatalf("expected escrow balance %s, got %s", invResp.PayAmount.String(), m.BalanceUSD.String())
	}

	// 3. Customer accidentally sends an additional $25 to the same deposit address
	deltaAmount := decimal.NewFromFloat(25.0)
	inv2, err := svc.RecordPayment(ctx, invResp.DepositAddress, deltaAmount, "0xoverpay_delta_tx", domain.NetworkBSC, 1001)
	if err != nil {
		t.Fatalf("overpay payment failed: %v", err)
	}

	expectedReceived := invResp.PayAmount.Add(deltaAmount)
	if !inv2.ReceivedAmount.Equal(expectedReceived) {
		t.Fatalf("expected invoice received amount %s, got %s", expectedReceived.String(), inv2.ReceivedAmount.String())
	}

	// Verify merchant escrow balance was only credited with the delta ($25), NOT the entire $100 invoice again!
	db.First(&m, "id = ?", merchant.ID)
	expectedBalance := invResp.PayAmount.Add(deltaAmount) // 100 + 25 = 125
	if !m.BalanceUSD.Equal(expectedBalance) {
		t.Fatalf("expected merchant balance %s (100 + 25), but got %s (possible double credit bug!)",
			expectedBalance.String(), m.BalanceUSD.String())
	}
}
