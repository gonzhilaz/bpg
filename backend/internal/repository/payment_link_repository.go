package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"

	"13c-gateway/internal/domain"
)

// PaymentLinkRepository defines database operations for no-code payment links
type PaymentLinkRepository interface {
	Create(ctx context.Context, pl *domain.PaymentLink) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.PaymentLink, error)
	GetBySlug(ctx context.Context, slug string) (*domain.PaymentLink, error)
	ListByMerchant(ctx context.Context, merchantID uuid.UUID) ([]domain.PaymentLink, error)
	Update(ctx context.Context, pl *domain.PaymentLink) error
	RecordPayment(ctx context.Context, id uuid.UUID, amount decimal.Decimal) error
}

type paymentLinkRepository struct {
	db *gorm.DB
}

// NewPaymentLinkRepository creates a new payment link repository
func NewPaymentLinkRepository(db *gorm.DB) PaymentLinkRepository {
	return &paymentLinkRepository{db: db}
}

func (r *paymentLinkRepository) Create(ctx context.Context, pl *domain.PaymentLink) error {
	return r.db.WithContext(ctx).Create(pl).Error
}

func (r *paymentLinkRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.PaymentLink, error) {
	var pl domain.PaymentLink
	if err := r.db.WithContext(ctx).Preload("Merchant").First(&pl, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &pl, nil
}

func (r *paymentLinkRepository) GetBySlug(ctx context.Context, slug string) (*domain.PaymentLink, error) {
	var pl domain.PaymentLink
	if err := r.db.WithContext(ctx).Preload("Merchant").First(&pl, "slug = ?", slug).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &pl, nil
}

func (r *paymentLinkRepository) ListByMerchant(ctx context.Context, merchantID uuid.UUID) ([]domain.PaymentLink, error) {
	var links []domain.PaymentLink
	err := r.db.WithContext(ctx).Where("merchant_id = ?", merchantID).Order("created_at DESC").Find(&links).Error
	return links, err
}

func (r *paymentLinkRepository) Update(ctx context.Context, pl *domain.PaymentLink) error {
	return r.db.WithContext(ctx).Save(pl).Error
}

func (r *paymentLinkRepository) RecordPayment(ctx context.Context, id uuid.UUID, amount decimal.Decimal) error {
	return r.db.WithContext(ctx).Model(&domain.PaymentLink{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"total_collected": gorm.Expr("total_collected + ?", amount),
			"payment_count":   gorm.Expr("payment_count + 1"),
		}).Error
}
