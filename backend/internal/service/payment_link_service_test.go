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

func setupPaymentLinkTest(t *testing.T) (*gorm.DB, service.PaymentLinkService, *domain.Merchant) {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open in-memory db: %v", err)
	}

	_ = db.AutoMigrate(
		&domain.Merchant{},
		&domain.Invoice{},
		&domain.BlockchainTransaction{},
		&domain.PaymentLink{},
	)

	mID := uuid.New()
	merchant := &domain.Merchant{
		ID:        mID,
		Email:     "link_" + mID.String()[:8] + "@example.com",
		Name:      "Link Test Merchant",
		APIKey:    "13c_live_" + mID.String()[:12],
		SecretKey: "sec_link_secret",
	}
	db.Create(merchant)

	linkRepo := repository.NewPaymentLinkRepository(db)
	merchantRepo := repository.NewMerchantRepository(db)
	invRepo := repository.NewInvoiceRepository(db)
	txRepo := repository.NewTransactionRepository(db)
	rateSvc := service.NewRateService()
	invSvc := service.NewInvoiceService(invRepo, txRepo, rateSvc, nil, nil, "01234567890123456789012345678901", 30)

	linkSvc := service.NewPaymentLinkService(linkRepo, merchantRepo, invSvc)
	return db, linkSvc, merchant
}

func TestPaymentLink_CreateAndRetrieve(t *testing.T) {
	_, svc, merchant := setupPaymentLinkTest(t)
	ctx := context.Background()

	amt := decimal.NewFromFloat(49.99)
	req := &service.CreatePaymentLinkRequest{
		Title:       "VIP Membership Subscription",
		Description: "Access to private Discord and research calls",
		Amount:      &amt,
		Currency:    "USD",
		PayNetwork:  domain.NetworkTron,
	}

	link, err := svc.CreateLink(ctx, merchant, req)
	if err != nil {
		t.Fatalf("failed to create payment link: %v", err)
	}

	if link.Slug == "" {
		t.Fatal("expected non-empty slug")
	}

	retrieved, err := svc.GetLinkBySlug(ctx, link.Slug)
	if err != nil || retrieved == nil {
		t.Fatalf("failed to retrieve link by slug: %v", err)
	}
	if retrieved.Title != "VIP Membership Subscription" {
		t.Fatalf("expected title 'VIP Membership Subscription', got '%s'", retrieved.Title)
	}
	if retrieved.Amount == nil || !retrieved.Amount.Equal(amt) {
		t.Fatalf("expected amount %s, got %v", amt.String(), retrieved.Amount)
	}
}

func TestPaymentLink_GenerateInvoice(t *testing.T) {
	_, svc, merchant := setupPaymentLinkTest(t)
	ctx := context.Background()

	// Open amount payment link
	req := &service.CreatePaymentLinkRequest{
		Title:      "Consultation Donation",
		Amount:     nil, // open amount
		Currency:   "USD",
		PayNetwork: domain.NetworkBSC,
	}

	link, err := svc.CreateLink(ctx, merchant, req)
	if err != nil {
		t.Fatalf("failed to create open link: %v", err)
	}

	// Customer enters custom $75.00
	customAmt := decimal.NewFromFloat(75.00)
	inv, err := svc.GenerateInvoiceForLink(ctx, link.Slug, &customAmt)
	if err != nil {
		t.Fatalf("failed to generate invoice from open link: %v", err)
	}

	if inv.AmountRequested.Cmp(customAmt) != 0 {
		t.Fatalf("expected invoice amount %s, got %s", customAmt.String(), inv.AmountRequested.String())
	}
	if inv.DepositAddress == "" {
		t.Fatal("expected deposit address to be generated")
	}
}
