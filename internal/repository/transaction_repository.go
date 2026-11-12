package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"captain-gateway/internal/domain"
)

// TransactionRepository handles on-chain transaction records
type TransactionRepository interface {
	Create(ctx context.Context, tx *domain.BlockchainTransaction) error
	GetByTxHash(ctx context.Context, txHash string) (*domain.BlockchainTransaction, error)
	GetByInvoiceID(ctx context.Context, invoiceID uuid.UUID) ([]domain.BlockchainTransaction, error)
	Update(ctx context.Context, tx *domain.BlockchainTransaction) error
}

type transactionRepository struct {
	db *gorm.DB
}

// NewTransactionRepository creates a new transaction repository
func NewTransactionRepository(db *gorm.DB) TransactionRepository {
	return &transactionRepository{db: db}
}

func (r *transactionRepository) Create(ctx context.Context, tx *domain.BlockchainTransaction) error {
	return r.db.WithContext(ctx).Create(tx).Error
}

func (r *transactionRepository) GetByTxHash(ctx context.Context, txHash string) (*domain.BlockchainTransaction, error) {
	var tx domain.BlockchainTransaction
	err := r.db.WithContext(ctx).First(&tx, "tx_hash = ?", txHash).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &tx, nil
}

func (r *transactionRepository) GetByInvoiceID(ctx context.Context, invoiceID uuid.UUID) ([]domain.BlockchainTransaction, error) {
	var txs []domain.BlockchainTransaction
	err := r.db.WithContext(ctx).Where("invoice_id = ?", invoiceID).Find(&txs).Error
	return txs, err
}

func (r *transactionRepository) Update(ctx context.Context, tx *domain.BlockchainTransaction) error {
	return r.db.WithContext(ctx).Save(tx).Error
}

