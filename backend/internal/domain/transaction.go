package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// TxStatus represents transaction verification status
type TxStatus string

const (
	TxStatusUnconfirmed TxStatus = "UNCONFIRMED"
	TxStatusConfirmed   TxStatus = "CONFIRMED"
	TxStatusFailed      TxStatus = "FAILED"
)

// BlockchainTransaction represents an on-chain transfer detected by watcher
type BlockchainTransaction struct {
	ID            uuid.UUID       `gorm:"type:uuid;primaryKey" json:"id"`
	InvoiceID     uuid.UUID       `gorm:"type:uuid;index;not null" json:"invoice_id"`
	Network       Network         `gorm:"type:varchar(20);index;not null" json:"network"`
	TxHash        string          `gorm:"type:varchar(128);uniqueIndex;not null" json:"tx_hash"`
	FromAddress   string          `gorm:"type:varchar(128);not null" json:"from_address"`
	ToAddress     string          `gorm:"type:varchar(128);index;not null" json:"to_address"`
	Amount        decimal.Decimal `gorm:"type:numeric(28,8);not null" json:"amount"`
	TokenSymbol   string          `gorm:"type:varchar(10);not null" json:"token_symbol"`
	BlockNumber   uint64          `gorm:"not null" json:"block_number"`
	Confirmations uint64          `gorm:"default:0" json:"confirmations"`
	Status        TxStatus        `gorm:"type:varchar(20);default:'UNCONFIRMED'" json:"status"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`

	Invoice       *Invoice        `gorm:"foreignKey:InvoiceID" json:"invoice,omitempty"`
}

// BeforeCreate hook
func (t *BlockchainTransaction) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

