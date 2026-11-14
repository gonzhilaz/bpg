package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"

	"13c-gateway/internal/domain"
	"13c-gateway/internal/middleware"
	"13c-gateway/internal/service"
	"13c-gateway/internal/sse"
	"13c-gateway/pkg/response"
)

// InvoiceHandler handles invoice HTTP endpoints
type InvoiceHandler struct {
	invoiceSvc service.InvoiceService
}

// NewInvoiceHandler creates a new InvoiceHandler
func NewInvoiceHandler(invoiceSvc service.InvoiceService) *InvoiceHandler {
	return &InvoiceHandler{invoiceSvc: invoiceSvc}
}

// Create generates a new invoice with an ephemeral deposit address
func (h *InvoiceHandler) Create(c *gin.Context) {
	merchant := middleware.GetCurrentMerchant(c)
	if merchant == nil {
		response.Unauthorized(c, "Merchant not authenticated")
		return
	}

	var req service.CreateInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid invoice request payload", err.Error())
		return
	}

	inv, err := h.invoiceSvc.CreateInvoice(c.Request.Context(), merchant, &req)
	if err != nil {
		response.InternalServerError(c, "Failed to create invoice", err.Error())
		return
	}

	response.Success(c, http.StatusCreated, "Invoice created successfully", inv)
}

// GetByID returns invoice status for customer checkout screen
func (h *InvoiceHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")
	invoiceID, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(c, "Invalid invoice UUID format", err.Error())
		return
	}

	inv, err := h.invoiceSvc.GetInvoice(c.Request.Context(), invoiceID)
	if err != nil {
		response.NotFound(c, "Invoice not found or expired")
		return
	}

	response.Success(c, http.StatusOK, "Invoice retrieved successfully", inv)
}

// SimulatePaymentRequest payload for sandbox payment simulation
type SimulatePaymentRequest struct {
	DepositAddress string          `json:"deposit_address" binding:"required"`
	Amount         decimal.Decimal `json:"amount" binding:"required"`
	TxHash         string          `json:"tx_hash"`
	Network        domain.Network  `json:"network"`
	BlockNumber    uint64          `json:"block_number"`
}

// SimulatePayment simulates an on-chain transfer to test reconciliation & state machine
func (h *InvoiceHandler) SimulatePayment(c *gin.Context) {
	var req SimulatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid simulation payload", err.Error())
		return
	}

	if req.TxHash == "" {
		req.TxHash = "0xsimulated_" + uuid.New().String()
	}
	if req.BlockNumber == 0 {
		req.BlockNumber = 12345678
	}
	if req.Network == "" {
		req.Network = domain.NetworkBSC
	}

	inv, err := h.invoiceSvc.RecordPayment(c.Request.Context(), req.DepositAddress, req.Amount, req.TxHash, req.Network, req.BlockNumber)
	if err != nil {
		response.InternalServerError(c, "Failed to simulate payment", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Payment simulated successfully", gin.H{
		"invoice_id":      inv.ID,
		"status":          inv.Status,
		"received_amount": inv.ReceivedAmount,
		"pay_amount":      inv.PayAmount,
	})
}

// StreamEvents streams real-time invoice status updates via Server-Sent Events (SSE)
func (h *InvoiceHandler) StreamEvents(c *gin.Context) {
	idParam := c.Param("id")
	invoiceID, err := uuid.Parse(idParam)
	if err != nil {
		c.String(http.StatusBadRequest, "Invalid invoice UUID")
		return
	}

	inv, err := h.invoiceSvc.GetInvoice(c.Request.Context(), invoiceID)
	if err != nil {
		c.String(http.StatusNotFound, "Invoice not found or expired")
		return
	}

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Transfer-Encoding", "chunked")
	c.Writer.Flush()

	hub := sse.GetHub()
	ch, cleanup := hub.Subscribe(idParam)
	defer cleanup()

	// 1. Send initial state immediately
	initialEvt := sse.InvoiceEvent{
		Event:          "connected",
		InvoiceID:      idParam,
		Status:         string(inv.Status),
		ReceivedAmount: inv.ReceivedAmount.String(),
		PayAmount:      inv.PayAmount.String(),
	}
	_, _ = c.Writer.WriteString(sse.FormatSSE(initialEvt))
	c.Writer.Flush()

	// 2. Stream events or ping heartbeat
	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-c.Request.Context().Done():
			return
		case <-ticker.C:
			// SSE comment ping to prevent proxy/browser timeout
			_, _ = c.Writer.WriteString(": ping\n\n")
			c.Writer.Flush()
		case evt, ok := <-ch:
			if !ok {
				return
			}
			_, _ = c.Writer.WriteString(sse.FormatSSE(evt))
			c.Writer.Flush()
			if evt.Status == string(domain.StatusPaid) || evt.Status == string(domain.StatusExpired) {
				return
			}
		}
	}
}

