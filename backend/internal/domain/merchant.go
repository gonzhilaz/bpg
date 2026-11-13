package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// Merchant represents the account or owner configuration for payout destination
type Merchant struct {
	ID                   uuid.UUID       `gorm:"type:uuid;primaryKey" json:"id"`
	Email                string          `gorm:"type:varchar(100);uniqueIndex" json:"email"`
	PasswordHash         string          `gorm:"type:varchar(255)" json:"-"`
	Name                 string          `gorm:"type:varchar(100);not null" json:"name"`
	Role                 string          `gorm:"type:varchar(20);default:'merchant'" json:"role"`
	Status               string          `gorm:"type:varchar(20);default:'ACTIVE'" json:"status"`
	APIKey               string          `gorm:"type:varchar(64);uniqueIndex;not null" json:"api_key"`
	APIKeyHash           string          `gorm:"type:varchar(64);index" json:"-"`
	APIKeyPrefix         string          `gorm:"type:varchar(24)" json:"api_key_prefix"`
	SecretKey            string          `gorm:"type:varchar(64);not null" json:"secret_key"`
	PayoutAddressBSC     string          `gorm:"type:varchar(128)" json:"payout_address_bsc"`
	PayoutAddressPolygon string          `gorm:"type:varchar(128)" json:"payout_address_polygon"`
	PayoutAddressTron    string          `gorm:"type:varchar(128)" json:"payout_address_tron"`
	PayoutAddressSolana  string          `gorm:"type:varchar(128)" json:"payout_address_solana"`
	AutoPayoutEnabled    bool            `gorm:"default:true" json:"auto_payout_enabled"`
	FeePayer             string          `gorm:"type:varchar(20);default:'customer'" json:"fee_payer"`
	SettlementMode       string          `gorm:"type:varchar(30);default:'ESCROW_BALANCE'" json:"settlement_mode"` // "ESCROW_BALANCE" or "INSTANT_FORWARD"
	BalanceUSD           decimal.Decimal `gorm:"type:numeric(28,8);default:0" json:"balance_usd"`
	LockedBalanceUSD     decimal.Decimal `gorm:"type:numeric(28,8);default:0" json:"locked_balance_usd"`
	WebhookURL           string          `gorm:"type:text" json:"webhook_url"`
	CreatedAt            time.Time       `json:"created_at"`
	UpdatedAt            time.Time       `json:"updated_at"`
	DeletedAt            gorm.DeletedAt  `gorm:"index" json:"-"`
}

// BeforeCreate hook to auto-generate UUID
func (m *Merchant) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}

