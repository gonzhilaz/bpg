package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"captain-gateway/internal/crypto"
	"captain-gateway/internal/domain"
	"captain-gateway/internal/repository"
)

// RegisterRequest defines merchant self-service onboarding payload
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
}

// LoginRequest defines merchant or admin sign-in payload
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse returns session token and merchant credentials
type AuthResponse struct {
	Token        string          `json:"token"`
	Merchant     *domain.Merchant `json:"merchant"`
	RawAPIKey    string          `json:"raw_api_key,omitempty"` // Revealed ONLY upon registration or regeneration
	RawSecretKey string          `json:"raw_secret_key,omitempty"`
}

// RegenerateKeyResponse returns newly rotated credentials
type RegenerateKeyResponse struct {
	RawAPIKey    string `json:"raw_api_key"`
	APIKeyPrefix string `json:"api_key_prefix"`
	RawSecretKey string `json:"raw_secret_key"`
}

// AuthService defines business logic for registration and session handling
type AuthService interface {
	Register(ctx context.Context, req *RegisterRequest) (*AuthResponse, error)
	Login(ctx context.Context, req *LoginRequest) (*AuthResponse, error)
	RegenerateAPIKey(ctx context.Context, merchantID uuid.UUID) (*RegenerateKeyResponse, error)
}

type authService struct {
	merchantRepo repository.MerchantRepository
	jwtSecret    string
}

// NewAuthService creates a new AuthService instance
func NewAuthService(merchantRepo repository.MerchantRepository, jwtSecret string) AuthService {
	return &authService{
		merchantRepo: merchantRepo,
		jwtSecret:    jwtSecret,
	}
}

func (s *authService) Register(ctx context.Context, req *RegisterRequest) (*AuthResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))

	// 1. Check uniqueness
	existing, err := s.merchantRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("failed to verify email: %w", err)
	}
	if existing != nil {
		return nil, errors.New("email is already registered")
	}

	// 2. Hash password
	pwdHash, err := crypto.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// 3. Generate 1 Unique High-Security API Key (Reveal Once)
	rawKey, keyHash, keyPrefix, err := crypto.GenerateSecureAPIKey("live")
	if err != nil {
		return nil, fmt.Errorf("failed to generate api key: %w", err)
	}

	secretKey, err := crypto.GenerateSecureSecretKey()
	if err != nil {
		return nil, fmt.Errorf("failed to generate secret key: %w", err)
	}

	merchant := &domain.Merchant{
		ID:                uuid.New(),
		Email:             email,
		PasswordHash:      pwdHash,
		Name:              strings.TrimSpace(req.Name),
		Role:              "merchant",
		Status:            "ACTIVE",
		APIKey:            rawKey, // Kept for backward compatibility
		APIKeyHash:        keyHash,
		APIKeyPrefix:      keyPrefix,
		SecretKey:         secretKey,
		AutoPayoutEnabled: true,
		FeePayer:          "customer",
	}

	if err := s.merchantRepo.Create(ctx, merchant); err != nil {
		return nil, fmt.Errorf("failed to create merchant account: %w", err)
	}

	token, err := crypto.SignJWT(merchant.ID, merchant.Email, merchant.Role, s.jwtSecret, 24*time.Hour)
	if err != nil {
		return nil, fmt.Errorf("failed to sign token: %w", err)
	}

	return &AuthResponse{
		Token:        token,
		Merchant:     merchant,
		RawAPIKey:    rawKey,
		RawSecretKey: secretKey,
	}, nil
}

func (s *authService) Login(ctx context.Context, req *LoginRequest) (*AuthResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))

	merchant, err := s.merchantRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("failed to find merchant: %w", err)
	}
	if merchant == nil {
		return nil, errors.New("invalid email or password")
	}

	if !crypto.CheckPassword(req.Password, merchant.PasswordHash) {
		return nil, errors.New("invalid email or password")
	}

	if merchant.Status != "ACTIVE" {
		return nil, errors.New("account is suspended. Please contact administrator.")
	}

	token, err := crypto.SignJWT(merchant.ID, merchant.Email, merchant.Role, s.jwtSecret, 24*time.Hour)
	if err != nil {
		return nil, fmt.Errorf("failed to sign token: %w", err)
	}

	return &AuthResponse{
		Token:    token,
		Merchant: merchant,
	}, nil
}

func (s *authService) RegenerateAPIKey(ctx context.Context, merchantID uuid.UUID) (*RegenerateKeyResponse, error) {
	merchant, err := s.merchantRepo.GetByID(ctx, merchantID)
	if err != nil {
		return nil, err
	}
	if merchant == nil {
		return nil, errors.New("merchant not found")
	}

	rawKey, keyHash, keyPrefix, err := crypto.GenerateSecureAPIKey("live")
	if err != nil {
		return nil, fmt.Errorf("failed to generate api key: %w", err)
	}

	secretKey, err := crypto.GenerateSecureSecretKey()
	if err != nil {
		return nil, fmt.Errorf("failed to generate secret key: %w", err)
	}

	merchant.APIKey = rawKey
	merchant.APIKeyHash = keyHash
	merchant.APIKeyPrefix = keyPrefix
	merchant.SecretKey = secretKey

	if err := s.merchantRepo.Update(ctx, merchant); err != nil {
		return nil, fmt.Errorf("failed to update merchant credentials: %w", err)
	}

	return &RegenerateKeyResponse{
		RawAPIKey:    rawKey,
		APIKeyPrefix: keyPrefix,
		RawSecretKey: secretKey,
	}, nil
}
