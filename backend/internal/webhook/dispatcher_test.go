package webhook

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestDispatchSync_InjectsIdempotencyAndDeliveryHeaders(t *testing.T) {
	AllowLocalhostForTesting = true
	defer func() { AllowLocalhostForTesting = false }()

	var receivedDeliveryID string
	var receivedIdempotencyKey string
	var receivedSignature string
	var receivedTimestamp string
	var receivedUserAgent string

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		receivedDeliveryID = r.Header.Get("X-13C-Delivery-ID")
		receivedIdempotencyKey = r.Header.Get("Idempotency-Key")
		receivedSignature = r.Header.Get("X-13C-Signature")
		receivedTimestamp = r.Header.Get("X-Timestamp")
		receivedUserAgent = r.Header.Get("User-Agent")

		body, _ := io.ReadAll(r.Body)
		if len(body) == 0 {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"received"}`))
	}))
	defer server.Close()

	dispatcher := NewDispatcher()
	payload := WebhookPayload{
		Event:          "invoice.paid",
		InvoiceID:      "inv_test_12345",
		OrderID:        "order_999",
		Status:         "PAID",
		PayCurrency:    "USDT",
		PayNetwork:     "BSC",
		PayAmount:      "50.00",
		ReceivedAmount: "50.00",
		DepositAddress: "0x1234567890abcdef1234567890abcdef12345678",
		Timestamp:      time.Now().Unix(),
	}

	secretKey := "sec_test_secret_key_12345"
	result, err := dispatcher.DispatchSync(context.Background(), server.URL, secretKey, payload)
	if err != nil {
		t.Fatalf("unexpected error during dispatch sync: %v", err)
	}

	if !result.Success {
		t.Fatalf("expected result.Success to be true, got false (status %d, body %s)", result.StatusCode, result.ResponseBody)
	}

	if !strings.HasPrefix(receivedDeliveryID, "del_") {
		t.Fatalf("expected X-13C-Delivery-ID to start with 'del_', got '%s'", receivedDeliveryID)
	}

	if receivedIdempotencyKey != receivedDeliveryID {
		t.Fatalf("expected Idempotency-Key '%s' to match X-13C-Delivery-ID '%s'", receivedIdempotencyKey, receivedDeliveryID)
	}

	if receivedSignature == "" {
		t.Fatal("expected non-empty X-13C-Signature")
	}

	if receivedTimestamp == "" {
		t.Fatal("expected non-empty X-Timestamp")
	}

	if receivedUserAgent != "13C-Crypto-Gateway/1.0" {
		t.Fatalf("expected User-Agent '13C-Crypto-Gateway/1.0', got '%s'", receivedUserAgent)
	}

	if result.DeliveryID != receivedDeliveryID {
		t.Fatalf("expected ReplayResult.DeliveryID '%s' to match received '%s'", result.DeliveryID, receivedDeliveryID)
	}
}

func TestValidateSafeWebhookURL_BlocksSSRF(t *testing.T) {
	AllowLocalhostForTesting = false

	dangerousTargets := []string{
		"http://localhost:8080/admin",
		"http://127.0.0.1:9000/internal",
		"http://169.254.169.254/latest/meta-data/", // AWS metadata
		"http://10.0.0.5/api",                      // Private IP
		"http://192.168.1.1/router",                // Private IP
		"http://172.16.0.10/database",              // Private IP
		"ftp://myshop.com/webhook",                 // Non-HTTP
	}

	for _, target := range dangerousTargets {
		err := ValidateSafeWebhookURL(target)
		if err == nil {
			t.Fatalf("expected SSRF error for target '%s', but it passed", target)
		}
	}

	// Valid public target must pass
	validTargets := []string{
		"https://api.merchant.com/v1/callbacks",
		"https://webhooks.store.io/crypto",
	}

	for _, valid := range validTargets {
		err := ValidateSafeWebhookURL(valid)
		if err != nil {
			t.Fatalf("expected valid target '%s' to pass, got error: %v", valid, err)
		}
	}
}

