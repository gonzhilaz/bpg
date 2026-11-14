package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"13c-gateway/internal/middleware"
	"13c-gateway/internal/webhook"
	"13c-gateway/pkg/response"
)

// WebhookHandler handles webhook test and replay requests
type WebhookHandler struct {
	dispatcher webhook.Dispatcher
}

// NewWebhookHandler creates a new WebhookHandler
func NewWebhookHandler(dispatcher webhook.Dispatcher) *WebhookHandler {
	return &WebhookHandler{dispatcher: dispatcher}
}

// TestDispatch sends a test payload to the merchant's webhook URL and returns real-time diagnostics
func (h *WebhookHandler) TestDispatch(c *gin.Context) {
	merchant := middleware.GetCurrentMerchant(c)
	if merchant == nil {
		response.Unauthorized(c, "Merchant session required")
		return
	}

	var req struct {
		TargetURL string `json:"target_url"`
		Event     string `json:"event"`
		OrderID   string `json:"order_id"`
	}
	_ = c.ShouldBindJSON(&req)

	targetURL := req.TargetURL
	if targetURL == "" {
		targetURL = merchant.WebhookURL
	}
	if targetURL == "" {
		response.BadRequest(c, "No target webhook URL provided or configured", nil)
		return
	}

	event := req.Event
	if event == "" {
		event = "invoice.paid"
	}

	orderID := req.OrderID
	if orderID == "" {
		orderID = "TEST-ORD-13C"
	}

	payload := webhook.WebhookPayload{
		Event:          event,
		InvoiceID:      "test-inv-uuid-001",
		OrderID:        orderID,
		Status:         "PAID",
		PayCurrency:    "USDT",
		PayNetwork:     "TRON",
		PayAmount:      "100.0000",
		ReceivedAmount: "100.0000",
		DepositAddress: "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa",
		Timestamp:      time.Now().Unix(),
	}

	result, err := h.dispatcher.DispatchSync(c.Request.Context(), targetURL, merchant.SecretKey, payload)
	if err != nil {
		response.InternalServerError(c, "Webhook dispatch failed", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Webhook test dispatch completed", result)
}

