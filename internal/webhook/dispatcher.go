package webhook

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"captain-gateway/internal/domain"
)

// WebhookPayload represents the notification body delivered to merchant
type WebhookPayload struct {
	Event          string `json:"event"` // e.g. "invoice.paid", "invoice.detected"
	InvoiceID      string `json:"invoice_id"`
	OrderID        string `json:"order_id"`
	Status         string `json:"status"`
	PayCurrency    string `json:"pay_currency"`
	PayNetwork     string `json:"pay_network"`
	PayAmount      string `json:"pay_amount"`
	ReceivedAmount string `json:"received_amount"`
	DepositAddress string `json:"deposit_address"`
	Timestamp      int64  `json:"timestamp"`
}

// Dispatcher defines interface for delivering webhooks
type Dispatcher interface {
	DispatchInvoiceEvent(ctx context.Context, invoice *domain.Invoice, secretKey string, event string)
}

type webhookDispatcher struct {
	client *http.Client
}

// NewDispatcher creates a new webhook dispatcher
func NewDispatcher() Dispatcher {
	return &webhookDispatcher{
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

// DispatchInvoiceEvent sends HMAC-signed webhook in background goroutine with retries
func (d *webhookDispatcher) DispatchInvoiceEvent(ctx context.Context, invoice *domain.Invoice, secretKey string, event string) {
	if invoice.CallbackURL == "" {
		return
	}

	payload := WebhookPayload{
		Event:          event,
		InvoiceID:      invoice.ID.String(),
		OrderID:        invoice.OrderID,
		Status:         string(invoice.Status),
		PayCurrency:    invoice.PayCurrency,
		PayNetwork:     string(invoice.PayNetwork),
		PayAmount:      invoice.PayAmount.String(),
		ReceivedAmount: invoice.ReceivedAmount.String(),
		DepositAddress: invoice.DepositAddress,
		Timestamp:      time.Now().Unix(),
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		log.Printf("[WEBHOOK ERROR] Failed to marshal payload: %v", err)
		return
	}

	// Compute HMAC-SHA256 signature
	mac := hmac.New(sha256.New, []byte(secretKey))
	mac.Write(bodyBytes)
	signature := hex.EncodeToString(mac.Sum(nil))

	// Deliver asynchronously with retries
	go d.deliverWithRetry(invoice.CallbackURL, bodyBytes, signature, payload.Timestamp)
}

func (d *webhookDispatcher) deliverWithRetry(targetURL string, body []byte, signature string, ts int64) {
	maxRetries := 3
	backoff := 2 * time.Second

	for attempt := 1; attempt <= maxRetries; attempt++ {
		req, err := http.NewRequest(http.MethodPost, targetURL, bytes.NewReader(body))
		if err != nil {
			log.Printf("[WEBHOOK ERROR] Invalid target URL %s: %v", targetURL, err)
			return
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Signature", signature)
		req.Header.Set("X-Timestamp", strconv.FormatInt(ts, 10))
		req.Header.Set("User-Agent", "Captain-Crypto-Gateway/1.0")

		resp, err := d.client.Do(req)
		if err == nil && resp.StatusCode >= 200 && resp.StatusCode < 300 {
			resp.Body.Close()
			log.Printf("[WEBHOOK SUCCESS] Delivered to %s (attempt %d)", targetURL, attempt)
			return
		}

		if resp != nil {
			resp.Body.Close()
		}

		log.Printf("[WEBHOOK RETRY] Delivery to %s failed (attempt %d/%d), retrying in %v...",
			targetURL, attempt, maxRetries, backoff)
		time.Sleep(backoff)
		backoff *= 2
	}

	log.Printf("[WEBHOOK FAILED] Delivery permanently failed after %d attempts: %s", maxRetries, targetURL)
}
