package sse

import (
	"encoding/json"
	"fmt"
	"sync"
)

// InvoiceEvent is the payload streamed to checkout clients
type InvoiceEvent struct {
	Event          string `json:"event"` // e.g. "connected", "detected", "paid", "underpaid", "expired"
	InvoiceID      string `json:"invoice_id"`
	Status         string `json:"status"`
	ReceivedAmount string `json:"received_amount"`
	PayAmount      string `json:"pay_amount"`
	TxHash         string `json:"tx_hash,omitempty"`
	Confirmations  uint64 `json:"confirmations,omitempty"`
}

// Hub manages active SSE client subscriptions per invoice
type Hub interface {
	Subscribe(invoiceID string) (chan InvoiceEvent, func())
	Broadcast(invoiceID string, event InvoiceEvent)
}

type hub struct {
	mu          sync.RWMutex
	subscribers map[string]map[chan InvoiceEvent]bool
}

var (
	globalHub *hub
	once      sync.Once
)

// GetHub returns the singleton SSE Hub instance
func GetHub() Hub {
	once.Do(func() {
		globalHub = &hub{
			subscribers: make(map[string]map[chan InvoiceEvent]bool),
		}
	})
	return globalHub
}

// Subscribe registers a new listener channel for a given invoice ID
func (h *hub) Subscribe(invoiceID string) (chan InvoiceEvent, func()) {
	h.mu.Lock()
	defer h.mu.Unlock()

	ch := make(chan InvoiceEvent, 8)
	if _, exists := h.subscribers[invoiceID]; !exists {
		h.subscribers[invoiceID] = make(map[chan InvoiceEvent]bool)
	}
	h.subscribers[invoiceID][ch] = true

	cleanup := func() {
		h.mu.Lock()
		defer h.mu.Unlock()
		if subs, exists := h.subscribers[invoiceID]; exists {
			delete(subs, ch)
			close(ch)
			if len(subs) == 0 {
				delete(h.subscribers, invoiceID)
			}
		}
	}

	return ch, cleanup
}

// Broadcast sends an event to all active subscribers for an invoice
func (h *hub) Broadcast(invoiceID string, event InvoiceEvent) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	subs, exists := h.subscribers[invoiceID]
	if !exists {
		return
	}

	for ch := range subs {
		select {
		case ch <- event:
		default:
			// Non-blocking drop if client is saturated
		}
	}
}

// FormatSSE formats an InvoiceEvent into SSE wire format: "event: ...\ndata: ...\n\n"
func FormatSSE(event InvoiceEvent) string {
	data, _ := json.Marshal(event)
	return fmt.Sprintf("event: %s\ndata: %s\n\n", event.Event, string(data))
}
