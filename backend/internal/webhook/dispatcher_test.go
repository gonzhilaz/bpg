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

