package service

import (
	"context"
	"testing"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"

	"captain-gateway/internal/domain"
	"captain-gateway/internal/repository"
)

func setupTestDB(t *testing.T) *gorm.DB {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open in-memory db: %v", err)
	}
	_ = db.AutoMigrate(&domain.Merchant{}, &domain.Invoice{}, &domain.PayoutTransfer{})
	return db
}

func TestAuthService_RegisterAndLogin(t *testing.T) {
	db := setupTestDB(t)
	merchantRepo := repository.NewMerchantRepository(db)
	authSvc := NewAuthService(merchantRepo, "test-jwt-secret-key-32bytes-long!")

	ctx := context.Background()

	// 1. Register new merchant
	regReq := &RegisterRequest{
		Email:    "merchant@test.com",
		Password: "password123",
		Name:     "Test Merchant Store",
	}

	regResp, err := authSvc.Register(ctx, regReq)
	if err != nil {
		t.Fatalf("register failed: %v", err)
	}
	if regResp.Token == "" {
		t.Fatal("expected non-empty JWT token")
	}
	if regResp.RawAPIKey == "" {
		t.Fatal("expected raw API key to be revealed on registration")
	}

	// 2. Login with correct credentials
	loginReq := &LoginRequest{
		Email:    "merchant@test.com",
		Password: "password123",
	}
	loginResp, err := authSvc.Login(ctx, loginReq)
	if err != nil {
		t.Fatalf("login failed: %v", err)
	}
	if loginResp.Merchant.Email != "merchant@test.com" {
		t.Fatalf("expected email merchant@test.com, got %s", loginResp.Merchant.Email)
	}

	// 3. Login with wrong password
	wrongReq := &LoginRequest{
		Email:    "merchant@test.com",
		Password: "wrongpassword",
	}
	_, err = authSvc.Login(ctx, wrongReq)
	if err == nil {
		t.Fatal("expected error on wrong password, got nil")
	}

	// 4. Regenerate API Key
	regenResp, err := authSvc.RegenerateAPIKey(ctx, regResp.Merchant.ID)
	if err != nil {
		t.Fatalf("regenerate api key failed: %v", err)
	}
	if regenResp.RawAPIKey == "" || regenResp.RawAPIKey == regResp.RawAPIKey {
		t.Fatal("expected new distinct raw API key")
	}
}
