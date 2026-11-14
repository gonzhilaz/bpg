package webhook

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"

	"13c-gateway/internal/domain"
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

// ReplayResult details the outcome of a manual or synchronous webhook delivery
type ReplayResult struct {
	StatusCode   int    `json:"status_code"`
	DurationMs   int64  `json:"duration_ms"`
	Success      bool   `json:"success"`
	ResponseBody string `json:"response_body"`
	Signature    string `json:"signature"`
	DeliveryID   string `json:"delivery_id"`
}

// Dispatcher defines interface for delivering webhooks
type Dispatcher interface {
	DispatchInvoiceEvent(ctx context.Context, invoice *domain.Invoice, secretKey string, event string)
	DispatchSync(ctx context.Context, targetURL, secretKey string, payload WebhookPayload) (*ReplayResult, error)
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

	// Deliver asynchronously with bounded retries
	go func() {
		wCtx, wCancel := context.WithTimeout(context.Background(), 45*time.Second)
		defer wCancel()
		d.deliverWithRetry(wCtx, invoice.CallbackURL, bodyBytes, signature, payload.Timestamp)
	}()
}

func (d *webhookDispatcher) deliverWithRetry(ctx context.Context, targetURL string, body []byte, signature string, ts int64) {
	// SSRF Defense: strictly reject internal, loopback, or cloud-metadata destinations
	if err := ValidateSafeWebhookURL(targetURL); err != nil {
		log.Printf("[WEBHOOK SSRF BLOCKED] Target URL %s rejected: %v", targetURL, err)
		return
	}

	maxRetries := 3
	backoff := 2 * time.Second
	deliveryID := fmt.Sprintf("del_%s", uuid.New().String()[:12])

	for attempt := 1; attempt <= maxRetries; attempt++ {
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, targetURL, bytes.NewReader(body))
		if err != nil {
			log.Printf("[WEBHOOK ERROR] Invalid target URL %s: %v", targetURL, err)
			return
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-13C-Delivery-ID", deliveryID)
		req.Header.Set("Idempotency-Key", deliveryID)
		req.Header.Set("X-13C-Signature", signature)
		req.Header.Set("X-Signature", signature)
		req.Header.Set("X-Timestamp", strconv.FormatInt(ts, 10))
		req.Header.Set("User-Agent", "13C-Crypto-Gateway/1.0")

		resp, err := d.client.Do(req)
		if err == nil && resp.StatusCode >= 200 && resp.StatusCode < 300 {
			resp.Body.Close()
			log.Printf("[WEBHOOK SUCCESS] Delivered to %s (attempt %d, delivery_id: %s)", targetURL, attempt, deliveryID)
			return
		}

		if resp != nil {
			resp.Body.Close()
		}

		log.Printf("[WEBHOOK RETRY] Delivery to %s failed (attempt %d/%d, delivery_id: %s), retrying in %v...",
			targetURL, attempt, maxRetries, deliveryID, backoff)
		select {
		case <-ctx.Done():
			log.Printf("[WEBHOOK ABORT] Context cancelled during retry backoff for %s", targetURL)
			return
		case <-time.After(backoff):
		}
		backoff *= 2
	}

	log.Printf("[WEBHOOK FAILED] Delivery permanently failed after %d attempts (delivery_id: %s): %s", maxRetries, deliveryID, targetURL)
}

// DispatchSync sends an immediate test or replay webhook and returns diagnostic telemetry
func (d *webhookDispatcher) DispatchSync(ctx context.Context, targetURL, secretKey string, payload WebhookPayload) (*ReplayResult, error) {
	deliveryID := fmt.Sprintf("del_%s", uuid.New().String()[:12])

	// SSRF Defense: check target URL
	if err := ValidateSafeWebhookURL(targetURL); err != nil {
		return &ReplayResult{
			StatusCode:   0,
			DurationMs:   0,
			Success:      false,
			ResponseBody: fmt.Sprintf("Security Rejected: %v", err),
			DeliveryID:   deliveryID,
		}, nil
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	mac := hmac.New(sha256.New, []byte(secretKey))
	mac.Write(bodyBytes)
	signature := hex.EncodeToString(mac.Sum(nil))

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, targetURL, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-13C-Delivery-ID", deliveryID)
	req.Header.Set("Idempotency-Key", deliveryID)
	req.Header.Set("X-13C-Signature", signature)
	req.Header.Set("X-Signature", signature)
	req.Header.Set("X-Timestamp", strconv.FormatInt(payload.Timestamp, 10))
	req.Header.Set("User-Agent", "13C-Crypto-Gateway/1.0")

	start := time.Now()
	resp, err := d.client.Do(req)
	duration := time.Since(start).Milliseconds()

	if err != nil {
		return &ReplayResult{
			StatusCode:   0,
			DurationMs:   duration,
			Success:      false,
			ResponseBody: err.Error(),
			Signature:    signature,
			DeliveryID:   deliveryID,
		}, nil
	}
	defer resp.Body.Close()

	buf := new(bytes.Buffer)
	_, _ = buf.ReadFrom(resp.Body)
	respStr := buf.String()
	if len(respStr) > 500 {
		respStr = respStr[:500] + "... (truncated)"
	}

	return &ReplayResult{
		StatusCode:   resp.StatusCode,
		DurationMs:   duration,
		Success:      resp.StatusCode >= 200 && resp.StatusCode < 300,
		ResponseBody: respStr,
		Signature:    signature,
		DeliveryID:   deliveryID,
	}, nil
}
