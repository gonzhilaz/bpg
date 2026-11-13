package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"13c-gateway/internal/domain"
)

// MerchantRepository defines DB operations for merchants
type MerchantRepository interface {
	Create(ctx context.Context, merchant *domain.Merchant) error
	GetByID(ctx context.Context, id uuid.UUID) (*domain.Merchant, error)
	GetByAPIKey(ctx context.Context, apiKey string) (*domain.Merchant, error)
	GetByAPIKeyOrHash(ctx context.Context, keyOrHash string) (*domain.Merchant, error)
	GetByEmail(ctx context.Context, email string) (*domain.Merchant, error)
	List(ctx context.Context, limit int, offset int) ([]domain.Merchant, int64, error)
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
	return r.GetByAPIKeyOrHash(ctx, apiKey)
}

func (r *merchantRepository) GetByAPIKeyOrHash(ctx context.Context, keyOrHash string) (*domain.Merchant, error) {
	var m domain.Merchant
	err := r.db.WithContext(ctx).First(&m, "api_key_hash = ? OR api_key = ?", keyOrHash, keyOrHash).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &m, nil
}

func (r *merchantRepository) GetByEmail(ctx context.Context, email string) (*domain.Merchant, error) {
	var m domain.Merchant
	err := r.db.WithContext(ctx).First(&m, "LOWER(email) = LOWER(?)", email).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &m, nil
}

func (r *merchantRepository) List(ctx context.Context, limit int, offset int) ([]domain.Merchant, int64, error) {
	var list []domain.Merchant
	var total int64
	db := r.db.WithContext(ctx).Model(&domain.Merchant{})
	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	if limit <= 0 {
		limit = 50
	}
	err := db.Order("created_at DESC").Limit(limit).Offset(offset).Find(&list).Error
	return list, total, err
}

func (r *merchantRepository) Update(ctx context.Context, merchant *domain.Merchant) error {
	return r.db.WithContext(ctx).Save(merchant).Error
}

