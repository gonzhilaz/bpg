package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"

	"13c-gateway/internal/domain"
)

// WithdrawalRepository manages withdrawal persistence and balance mutations
type WithdrawalRepository interface {
	Create(ctx context.Context, w *domain.WithdrawalRequest) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.WithdrawalRequest, error)
	ListByMerchant(ctx context.Context, merchantID uuid.UUID, limit, offset int) ([]domain.WithdrawalRequest, int64, error)
	ListAll(ctx context.Context, status string, limit, offset int) ([]domain.WithdrawalRequest, int64, error)
	Update(ctx context.Context, w *domain.WithdrawalRequest) error

	// Atomic Balance Ledger operations
	CreditEscrowBalance(ctx context.Context, merchantID uuid.UUID, amount decimal.Decimal) error
	LockBalanceForWithdrawal(ctx context.Context, merchantID uuid.UUID, amount decimal.Decimal) error
	RefundLockedBalance(ctx context.Context, merchantID uuid.UUID, amount decimal.Decimal) error
	FinalizeWithdrawalDeduction(ctx context.Context, merchantID uuid.UUID, amount decimal.Decimal) error
}

type withdrawalRepository struct {
	db *gorm.DB
}

// NewWithdrawalRepository creates a new withdrawal repository
func NewWithdrawalRepository(db *gorm.DB) WithdrawalRepository {
	return &withdrawalRepository{db: db}
}

func (r *withdrawalRepository) Create(ctx context.Context, w *domain.WithdrawalRequest) error {
	return r.db.WithContext(ctx).Create(w).Error
}

func (r *withdrawalRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.WithdrawalRequest, error) {
	var w domain.WithdrawalRequest
	err := r.db.WithContext(ctx).Preload("Merchant").First(&w, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &w, nil
}

func (r *withdrawalRepository) ListByMerchant(ctx context.Context, merchantID uuid.UUID, limit, offset int) ([]domain.WithdrawalRequest, int64, error) {
	var list []domain.WithdrawalRequest
	var total int64
	query := r.db.WithContext(ctx).Model(&domain.WithdrawalRequest{}).Where("merchant_id = ?", merchantID)
	query.Count(&total)
	err := query.Order("requested_at desc").Limit(limit).Offset(offset).Find(&list).Error
	return list, total, err
}

func (r *withdrawalRepository) ListAll(ctx context.Context, status string, limit, offset int) ([]domain.WithdrawalRequest, int64, error) {
	var list []domain.WithdrawalRequest
	var total int64
	query := r.db.WithContext(ctx).Model(&domain.WithdrawalRequest{}).Preload("Merchant")
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}
	query.Count(&total)
	err := query.Order("requested_at desc").Limit(limit).Offset(offset).Find(&list).Error
	return list, total, err
}

func (r *withdrawalRepository) Update(ctx context.Context, w *domain.WithdrawalRequest) error {
	return r.db.WithContext(ctx).Save(w).Error
}

// CreditEscrowBalance adds confirmed invoice net amount to merchant escrow balance
func (r *withdrawalRepository) CreditEscrowBalance(ctx context.Context, merchantID uuid.UUID, amount decimal.Decimal) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var m domain.Merchant
		if err := tx.First(&m, "id = ?", merchantID).Error; err != nil {
			return err
		}
		m.BalanceUSD = m.BalanceUSD.Add(amount)
		return tx.Save(&m).Error
	})
}

// LockBalanceForWithdrawal moves funds from BalanceUSD to LockedBalanceUSD
func (r *withdrawalRepository) LockBalanceForWithdrawal(ctx context.Context, merchantID uuid.UUID, amount decimal.Decimal) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var m domain.Merchant
		if err := tx.First(&m, "id = ?", merchantID).Error; err != nil {
			return err
		}
		if m.BalanceUSD.LessThan(amount) {
			return fmt.Errorf("insufficient escrow balance: available %s, requested %s", m.BalanceUSD.String(), amount.String())
		}
		m.BalanceUSD = m.BalanceUSD.Sub(amount)
		m.LockedBalanceUSD = m.LockedBalanceUSD.Add(amount)
		return tx.Save(&m).Error
	})
}

// RefundLockedBalance returns locked funds back to available balance upon rejection/cancel
func (r *withdrawalRepository) RefundLockedBalance(ctx context.Context, merchantID uuid.UUID, amount decimal.Decimal) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var m domain.Merchant
		if err := tx.First(&m, "id = ?", merchantID).Error; err != nil {
			return err
		}
		m.LockedBalanceUSD = m.LockedBalanceUSD.Sub(amount)
		m.BalanceUSD = m.BalanceUSD.Add(amount)
		return tx.Save(&m).Error
	})
}

// FinalizeWithdrawalDeduction clears the locked balance once payout is broadcast
func (r *withdrawalRepository) FinalizeWithdrawalDeduction(ctx context.Context, merchantID uuid.UUID, amount decimal.Decimal) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var m domain.Merchant
		if err := tx.First(&m, "id = ?", merchantID).Error; err != nil {
			return err
		}
		m.LockedBalanceUSD = m.LockedBalanceUSD.Sub(amount)
		return tx.Save(&m).Error
	})
}

