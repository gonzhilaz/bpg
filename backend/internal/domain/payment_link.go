package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// PaymentLink allows merchants to create static or reusable checkout links without API coding
type PaymentLink struct {
	ID             uuid.UUID        `gorm:"type:uuid;primaryKey" json:"id"`
	MerchantID     uuid.UUID        `gorm:"type:uuid;index;not null" json:"merchant_id"`
	Slug           string           `gorm:"type:varchar(64);uniqueIndex;not null" json:"slug"`
	Title          string           `gorm:"type:varchar(150);not null" json:"title"`
	Description    string           `gorm:"type:text" json:"description,omitempty"`
	Amount         *decimal.Decimal `gorm:"type:numeric(28,8)" json:"amount,omitempty"` // nil = open/custom amount
	Currency       string           `gorm:"type:varchar(10);default:'USD'" json:"currency"`
	PayNetwork     Network          `gorm:"type:varchar(20);default:'TRON'" json:"pay_network"`
	IsActive       bool             `gorm:"default:true" json:"is_active"`
	TotalCollected decimal.Decimal  `gorm:"type:numeric(28,8);default:0" json:"total_collected"`
	PaymentCount   int64            `gorm:"default:0" json:"payment_count"`
	CreatedAt      time.Time        `json:"created_at"`
	UpdatedAt      time.Time        `json:"updated_at"`

	Merchant       *Merchant        `gorm:"foreignKey:MerchantID" json:"merchant,omitempty"`
}

// BeforeCreate hook to auto-generate UUID
func (p *PaymentLink) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
