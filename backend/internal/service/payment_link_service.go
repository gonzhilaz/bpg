package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"

	"13c-gateway/internal/domain"
	"13c-gateway/internal/repository"
)

// CreatePaymentLinkRequest payload
type CreatePaymentLinkRequest struct {
	Title       string           `json:"title" binding:"required"`
	Description string           `json:"description"`
	Amount      *decimal.Decimal `json:"amount"` // nil = open amount
	Currency    string           `json:"currency"`
	PayNetwork  domain.Network   `json:"pay_network"`
}

// PaymentLinkService manages merchant no-code payment links
type PaymentLinkService interface {
	CreateLink(ctx context.Context, merchant *domain.Merchant, req *CreatePaymentLinkRequest) (*domain.PaymentLink, error)
	GetLinkBySlug(ctx context.Context, slug string) (*domain.PaymentLink, error)
	ListMerchantLinks(ctx context.Context, merchantID uuid.UUID) ([]domain.PaymentLink, error)
	ToggleLinkStatus(ctx context.Context, merchantID, linkID uuid.UUID) (*domain.PaymentLink, error)
	GenerateInvoiceForLink(ctx context.Context, slug string, requestedAmount *decimal.Decimal) (*InvoiceResponse, error)
}

type paymentLinkService struct {
	linkRepo     repository.PaymentLinkRepository
	merchantRepo repository.MerchantRepository
	invoiceSvc   InvoiceService
}

// NewPaymentLinkService creates a new PaymentLinkService
func NewPaymentLinkService(
	linkRepo repository.PaymentLinkRepository,
	merchantRepo repository.MerchantRepository,
	invoiceSvc InvoiceService,
) PaymentLinkService {
	return &paymentLinkService{
		linkRepo:     linkRepo,
		merchantRepo: merchantRepo,
		invoiceSvc:   invoiceSvc,
	}
}

func (s *paymentLinkService) CreateLink(ctx context.Context, merchant *domain.Merchant, req *CreatePaymentLinkRequest) (*domain.PaymentLink, error) {
	title := strings.TrimSpace(req.Title)
	if title == "" {
		return nil, errors.New("title is required")
	}

	curr := strings.ToUpper(strings.TrimSpace(req.Currency))
	if curr == "" {
		curr = "USD"
	}

	net := req.PayNetwork
	if net == "" {
		net = domain.NetworkTron
	}

	slug := "pl_" + strings.ToLower(uuid.New().String()[:10])

	pl := &domain.PaymentLink{
		MerchantID:  merchant.ID,
		Slug:        slug,
		Title:       title,
		Description: strings.TrimSpace(req.Description),
		Amount:      req.Amount,
		Currency:    curr,
		PayNetwork:  net,
		IsActive:    true,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := s.linkRepo.Create(ctx, pl); err != nil {
		return nil, fmt.Errorf("failed to create payment link: %w", err)
	}

	return pl, nil
}

func (s *paymentLinkService) GetLinkBySlug(ctx context.Context, slug string) (*domain.PaymentLink, error) {
	pl, err := s.linkRepo.GetBySlug(ctx, slug)
	if err != nil || pl == nil {
		return nil, errors.New("payment link not found")
	}
	return pl, nil
}

func (s *paymentLinkService) ListMerchantLinks(ctx context.Context, merchantID uuid.UUID) ([]domain.PaymentLink, error) {
	return s.linkRepo.ListByMerchant(ctx, merchantID)
}

func (s *paymentLinkService) ToggleLinkStatus(ctx context.Context, merchantID, linkID uuid.UUID) (*domain.PaymentLink, error) {
	pl, err := s.linkRepo.GetByID(ctx, linkID)
	if err != nil || pl == nil {
		return nil, errors.New("payment link not found")
	}
	if pl.MerchantID != merchantID {
		return nil, errors.New("unauthorized link access")
	}

	pl.IsActive = !pl.IsActive
	pl.UpdatedAt = time.Now()
	if err := s.linkRepo.Update(ctx, pl); err != nil {
		return nil, err
	}
	return pl, nil
}

func (s *paymentLinkService) GenerateInvoiceForLink(ctx context.Context, slug string, requestedAmount *decimal.Decimal) (*InvoiceResponse, error) {
	pl, err := s.linkRepo.GetBySlug(ctx, slug)
	if err != nil || pl == nil {
		return nil, errors.New("payment link not found")
	}

	if !pl.IsActive {
		return nil, errors.New("this payment link has been deactivated by merchant")
	}

	finalAmount := decimal.Zero
	if pl.Amount != nil && pl.Amount.GreaterThan(decimal.Zero) {
		finalAmount = *pl.Amount
	} else if requestedAmount != nil && requestedAmount.GreaterThan(decimal.Zero) {
		finalAmount = *requestedAmount
	} else {
		return nil, errors.New("valid payment amount is required")
	}

	merchant := pl.Merchant
	if merchant == nil && s.merchantRepo != nil {
		m, err := s.merchantRepo.GetByID(ctx, pl.MerchantID)
		if err == nil {
			merchant = m
		}
	}
	if merchant == nil {
		return nil, errors.New("merchant associated with link not found")
	}

	orderID := fmt.Sprintf("LINK-%s-%s", pl.Slug, uuid.New().String()[:6])

	invReq := &CreateInvoiceRequest{
		OrderID:         orderID,
		Amount:          finalAmount,
		Currency:        pl.Currency,
		PayCurrency:     "USDT",
		PayNetwork:      pl.PayNetwork,
		FeePayer:        "customer",
		CustomExpiryMin: 30,
	}

	return s.invoiceSvc.CreateInvoice(ctx, merchant, invReq)
}
