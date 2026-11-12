package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"captain-gateway/internal/domain"
)

// PayoutRepository handles payout and sweep records
type PayoutRepository interface {
	Create(ctx context.Context, payout *domain.PayoutTransfer) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.PayoutTransfer, error)
	GetByInvoiceID(ctx context.Context, invoiceID uuid.UUID) ([]domain.PayoutTransfer, error)
	Update(ctx context.Context, payout *domain.PayoutTransfer) error
}

type payoutRepository struct {
	db *gorm.DB
}

// NewPayoutRepository creates a new payout repository
func NewPayoutRepository(db *gorm.DB) PayoutRepository {
	return &payoutRepository{db: db}
}

func (r *payoutRepository) Create(ctx context.Context, payout *domain.PayoutTransfer) error {
	return r.db.WithContext(ctx).Create(payout).Error
}

func (r *payoutRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.PayoutTransfer, error) {
	var p domain.PayoutTransfer
	err := r.db.WithContext(ctx).First(&p, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

func (r *payoutRepository) GetByInvoiceID(ctx context.Context, invoiceID uuid.UUID) ([]domain.PayoutTransfer, error) {
	var list []domain.PayoutTransfer
	err := r.db.WithContext(ctx).Where("invoice_id = ?", invoiceID).Find(&list).Error
	return list, err
}

func (r *payoutRepository) Update(ctx context.Context, payout *domain.PayoutTransfer) error {
	return r.db.WithContext(ctx).Save(payout).Error
}

