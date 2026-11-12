package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Merchant represents the account or owner configuration for payout destination
type Merchant struct {
	ID                  uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Name                string         `gorm:"type:varchar(100);not null" json:"name"`
	APIKey              string         `gorm:"type:varchar(64);uniqueIndex;not null" json:"api_key"`
	SecretKey           string         `gorm:"type:varchar(64);not null" json:"secret_key"`
	PayoutAddressBSC    string         `gorm:"type:varchar(128)" json:"payout_address_bsc"`
	PayoutAddressPolygon string        `gorm:"type:varchar(128)" json:"payout_address_polygon"`
	PayoutAddressTron   string         `gorm:"type:varchar(128)" json:"payout_address_tron"`
	PayoutAddressSolana string         `gorm:"type:varchar(128)" json:"payout_address_solana"`
	AutoPayoutEnabled   bool           `gorm:"default:true" json:"auto_payout_enabled"`
	WebhookURL          string         `gorm:"type:text" json:"webhook_url"`
	CreatedAt           time.Time      `json:"created_at"`
	UpdatedAt           time.Time      `json:"updated_at"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"-"`
}

// BeforeCreate hook to auto-generate UUID
func (m *Merchant) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}

