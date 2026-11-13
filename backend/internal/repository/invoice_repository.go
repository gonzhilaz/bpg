package repository

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"13c-gateway/internal/domain"
)

// InvoiceRepository defines DB operations for invoices
type InvoiceRepository interface {
	Create(ctx context.Context, invoice *domain.Invoice) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Invoice, error)
	GetByDepositAddress(ctx context.Context, address string) (*domain.Invoice, error)
	GetActivePendingInvoices(ctx context.Context, network domain.Network) ([]domain.Invoice, error)
	Update(ctx context.Context, invoice *domain.Invoice) error
	ExpireOverdueInvoices(ctx context.Context, now time.Time) (int64, error)
}

type invoiceRepository struct {
	db *gorm.DB
}

// NewInvoiceRepository creates a new invoice repository
func NewInvoiceRepository(db *gorm.DB) InvoiceRepository {
	return &invoiceRepository{db: db}
}

func (r *invoiceRepository) Create(ctx context.Context, invoice *domain.Invoice) error {
	return r.db.WithContext(ctx).Create(invoice).Error
}

func (r *invoiceRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Invoice, error) {
	var inv domain.Invoice
	err := r.db.WithContext(ctx).Preload("Merchant").First(&inv, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &inv, nil
}

func (r *invoiceRepository) GetByDepositAddress(ctx context.Context, address string) (*domain.Invoice, error) {
	var inv domain.Invoice
	err := r.db.WithContext(ctx).Preload("Merchant").First(&inv, "deposit_address = ?", address).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &inv, nil
}

func (r *invoiceRepository) GetActivePendingInvoices(ctx context.Context, network domain.Network) ([]domain.Invoice, error) {
	var invoices []domain.Invoice
	err := r.db.WithContext(ctx).
		Where("pay_network = ? AND status IN (?, ?)", network, domain.StatusPending, domain.StatusDetected).
		Where("expires_at > ?", time.Now()).
		Find(&invoices).Error
	return invoices, err
}

func (r *invoiceRepository) Update(ctx context.Context, invoice *domain.Invoice) error {
	return r.db.WithContext(ctx).Save(invoice).Error
}

func (r *invoiceRepository) ExpireOverdueInvoices(ctx context.Context, now time.Time) (int64, error) {
	res := r.db.WithContext(ctx).Model(&domain.Invoice{}).
		Where("status = ? AND expires_at <= ?", domain.StatusPending, now).
		Update("status", domain.StatusExpired)
	return res.RowsAffected, res.Error
}

