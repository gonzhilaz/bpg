package sse_test

import (
	"strings"
	"testing"
	"time"

	"13c-gateway/internal/sse"
)

func TestSSEHub_SubscribeAndBroadcast(t *testing.T) {
	hub := sse.GetHub()
	invoiceID := "test-inv-001"

	ch, cleanup := hub.Subscribe(invoiceID)
	defer cleanup()

	expectedEvent := sse.InvoiceEvent{
		Event:          "paid",
		InvoiceID:      invoiceID,
		Status:         "PAID",
		ReceivedAmount: "100.00",
		PayAmount:      "100.00",
		TxHash:         "0x123abc456def",
	}

	go func() {
		time.Sleep(10 * time.Millisecond)
		hub.Broadcast(invoiceID, expectedEvent)
	}()

	select {
	case received := <-ch:
		if received.Status != "PAID" {
			t.Fatalf("expected status PAID, got %s", received.Status)
		}
		if received.TxHash != "0x123abc456def" {
			t.Fatalf("expected tx_hash 0x123abc456def, got %s", received.TxHash)
		}
	case <-time.After(500 * time.Millisecond):
		t.Fatal("timed out waiting for SSE broadcast")
	}
}

func TestFormatSSE(t *testing.T) {
	evt := sse.InvoiceEvent{
		Event:     "detected",
		InvoiceID: "inv-999",
		Status:    "DETECTED",
	}

	formatted := sse.FormatSSE(evt)
	if !strings.HasPrefix(formatted, "event: detected\n") {
		t.Fatalf("unexpected prefix: %s", formatted)
	}
	if !strings.Contains(formatted, `"status":"DETECTED"`) {
		t.Fatalf("missing status in data: %s", formatted)
	}
	if !strings.HasSuffix(formatted, "\n\n") {
		t.Fatalf("missing trailing double newline: %s", formatted)
	}
}
