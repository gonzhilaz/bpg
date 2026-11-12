package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"captain-gateway/internal/domain"
)

// MerchantRepository defines DB operations for merchants
type MerchantRepository interface {
	Create(ctx context.Context, merchant *domain.Merchant) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Merchant, error)
	GetByAPIKey(ctx context.Context, apiKey string) (*domain.Merchant, error)
	Update(ctx context.Context, merchant *domain.Merchant) error
}

type merchantRepository struct {
	db *gorm.DB
}

// NewMerchantRepository creates a new merchant repository
func NewMerchantRepository(db *gorm.DB) MerchantRepository {
	return &merchantRepository{db: db}
}

func (r *merchantRepository) Create(ctx context.Context, merchant *domain.Merchant) error {
	return r.db.WithContext(ctx).Create(merchant).Error
}

func (r *merchantRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Merchant, error) {
	var m domain.Merchant
	err := r.db.WithContext(ctx).First(&m, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &m, nil
}

func (r *merchantRepository) GetByAPIKey(ctx context.Context, apiKey string) (*domain.Merchant, error) {
	var m domain.Merchant
	err := r.db.WithContext(ctx).First(&m, "api_key = ?", apiKey).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &m, nil
}

func (r *merchantRepository) Update(ctx context.Context, merchant *domain.Merchant) error {
	return r.db.WithContext(ctx).Save(merchant).Error
}
