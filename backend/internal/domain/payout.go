package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// PayoutType represents whether it is instant or batched
type PayoutType string

const (
	PayoutTypeInstant PayoutType = "INSTANT_PAYOUT"
	PayoutTypeBatch   PayoutType = "BATCH_SWEEP"
	PayoutTypeManual  PayoutType = "MANUAL_SWEEP"
)

// PayoutStatus represents payout state
type PayoutStatus string

const (
	PayoutStatusPending   PayoutStatus = "PENDING"
	PayoutStatusSubmitted PayoutStatus = "SUBMITTED"
	PayoutStatusCompleted PayoutStatus = "COMPLETED"
	PayoutStatusFailed    PayoutStatus = "FAILED"
)

// PayoutTransfer records transfers from hot wallet or deposit address to merchant
type PayoutTransfer struct {
	ID               uuid.UUID       `gorm:"type:uuid;primaryKey" json:"id"`
	InvoiceID        uuid.UUID       `gorm:"type:uuid;index;not null" json:"invoice_id"`
	Network          Network         `gorm:"type:varchar(20);index;not null" json:"network"`
	PayoutTxHash     string          `gorm:"type:varchar(128);index" json:"payout_tx_hash"`
	RecipientAddress string          `gorm:"type:varchar(128);not null" json:"recipient_address"`
	AmountSent       decimal.Decimal `gorm:"type:numeric(28,8);not null" json:"amount_sent"`
	NetworkFeePaid   decimal.Decimal `gorm:"type:numeric(28,8);default:0" json:"network_fee_paid"`
	PayoutType       PayoutType      `gorm:"type:varchar(20);default:'INSTANT_PAYOUT'" json:"payout_type"`
	Status           PayoutStatus    `gorm:"type:varchar(20);default:'PENDING'" json:"status"`
	ErrorMessage     string          `gorm:"type:text" json:"error_message,omitempty"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`

	Invoice          *Invoice        `gorm:"foreignKey:InvoiceID" json:"invoice,omitempty"`
}

// BeforeCreate hook
func (p *PayoutTransfer) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

