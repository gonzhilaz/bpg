package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// InvoiceStatus represents invoice state
type InvoiceStatus string

const (
	StatusPending   InvoiceStatus = "PENDING"
	StatusDetected  InvoiceStatus = "DETECTED"
	StatusConfirmed InvoiceStatus = "CONFIRMED"
	StatusPaid      InvoiceStatus = "PAID"
	StatusUnderpaid InvoiceStatus = "UNDERPAID"
	StatusOverpaid  InvoiceStatus = "OVERPAID"
	StatusExpired   InvoiceStatus = "EXPIRED"
	StatusCancelled InvoiceStatus = "CANCELLED"
)

// Network represents supported blockchain network
type Network string

const (
	NetworkBSC     Network = "BSC"
	NetworkPolygon Network = "POLYGON"
	NetworkTron    Network = "TRON"
	NetworkSolana  Network = "SOLANA"
)

// Invoice represents a payment invoice with an ephemeral deposit address
type Invoice struct {
	ID               uuid.UUID       `gorm:"type:uuid;primaryKey" json:"id"`
	MerchantID       uuid.UUID       `gorm:"type:uuid;index;index:idx_merchant_created,priority:1;not null" json:"merchant_id"`
	OrderID          string          `gorm:"type:varchar(100);index;not null" json:"order_id"`
	AmountRequested  decimal.Decimal `gorm:"type:numeric(28,8);not null" json:"amount_requested"`
	CurrencyRequested string         `gorm:"type:varchar(10);not null" json:"currency_requested"`
	PayCurrency      string          `gorm:"type:varchar(10);not null" json:"pay_currency"`
	PayNetwork       Network         `gorm:"type:varchar(20);index:idx_invoices_watcher,priority:1;not null" json:"pay_network"`
	PayAmount        decimal.Decimal `gorm:"type:numeric(28,8);not null" json:"pay_amount"`
	FeePayer         string          `gorm:"type:varchar(20);default:'customer'" json:"fee_payer"`
	BaseAmount       decimal.Decimal `gorm:"type:numeric(28,8);default:0" json:"base_amount"`
	NetworkFee       decimal.Decimal `gorm:"type:numeric(28,8);default:0" json:"network_fee"`
	DepositAddress   string          `gorm:"type:varchar(128);index;not null" json:"deposit_address"`
	EncryptedPrivKey string          `gorm:"type:text;not null" json:"-"`
	UnderpaidTolerance decimal.Decimal `gorm:"type:numeric(5,2);default:0.0" json:"underpaid_tolerance"`
	Status           InvoiceStatus   `gorm:"type:varchar(20);index;index:idx_invoices_watcher,priority:2;default:'PENDING'" json:"status"`
	ReceivedAmount   decimal.Decimal `gorm:"type:numeric(28,8);default:0" json:"received_amount"`
	CallbackURL      string          `gorm:"type:text" json:"callback_url"`
	PayoutAddress    string          `gorm:"type:varchar(128)" json:"payout_address"`
	ExpiresAt        time.Time       `gorm:"index;index:idx_invoices_watcher,priority:3" json:"expires_at"`
	PaidAt           *time.Time      `json:"paid_at,omitempty"`
	CreatedAt        time.Time       `gorm:"index:idx_merchant_created,priority:2" json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
	DeletedAt        gorm.DeletedAt  `gorm:"index" json:"-"`

	Merchant         *Merchant       `gorm:"foreignKey:MerchantID" json:"merchant,omitempty"`
}

// BeforeCreate hook to auto-generate UUID
func (inv *Invoice) BeforeCreate(tx *gorm.DB) error {
	if inv.ID == uuid.Nil {
		inv.ID = uuid.New()
	}
	return nil
}

