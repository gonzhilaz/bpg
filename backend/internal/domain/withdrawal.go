package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// WithdrawalStatus indicates state of a merchant withdrawal request
type WithdrawalStatus string

const (
	WithdrawalStatusPending   WithdrawalStatus = "PENDING"
	WithdrawalStatusApproved  WithdrawalStatus = "APPROVED"
	WithdrawalStatusRejected  WithdrawalStatus = "REJECTED"
	WithdrawalStatusCompleted WithdrawalStatus = "COMPLETED"
	WithdrawalStatusFailed    WithdrawalStatus = "FAILED"
)

// WithdrawalRequest tracks merchant requests to pull funds from escrow
type WithdrawalRequest struct {
	ID            uuid.UUID        `gorm:"type:uuid;primaryKey" json:"id"`
	MerchantID    uuid.UUID        `gorm:"type:uuid;index;not null" json:"merchant_id"`
	Amount        decimal.Decimal  `gorm:"type:numeric(28,8);not null" json:"amount"`
	Currency      string           `gorm:"type:varchar(10);default:'USDT'" json:"currency"`
	Network       Network          `gorm:"type:varchar(20);not null" json:"network"`
	TargetAddress string           `gorm:"type:varchar(128);not null" json:"target_address"`
	Status        WithdrawalStatus `gorm:"type:varchar(20);index;default:'PENDING'" json:"status"`
	TxHash        string           `gorm:"type:varchar(128)" json:"tx_hash,omitempty"`
	AdminNotes    string           `gorm:"type:text" json:"admin_notes,omitempty"`
	ApprovedBy    string           `gorm:"type:varchar(100)" json:"approved_by,omitempty"`
	RequestedAt   time.Time        `gorm:"index" json:"requested_at"`
	ProcessedAt   *time.Time       `json:"processed_at,omitempty"`
	CreatedAt     time.Time        `json:"created_at"`
	UpdatedAt     time.Time        `json:"updated_at"`

	Merchant *Merchant `gorm:"foreignKey:MerchantID" json:"merchant,omitempty"`
}

// BeforeCreate hook to auto-generate UUID and timestamp
func (w *WithdrawalRequest) BeforeCreate(tx *gorm.DB) error {
	if w.ID == uuid.Nil {
		w.ID = uuid.New()
	}
	if w.RequestedAt.IsZero() {
		w.RequestedAt = time.Now()
	}
	return nil
}

