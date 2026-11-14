package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"

	"13c-gateway/internal/middleware"
	"13c-gateway/internal/service"
	"13c-gateway/pkg/response"
)

// PaymentLinkHandler handles payment link operations
type PaymentLinkHandler struct {
	linkSvc service.PaymentLinkService
}

// NewPaymentLinkHandler creates a new PaymentLinkHandler
func NewPaymentLinkHandler(linkSvc service.PaymentLinkService) *PaymentLinkHandler {
	return &PaymentLinkHandler{linkSvc: linkSvc}
}

// Create generates a new no-code payment link for merchant
func (h *PaymentLinkHandler) Create(c *gin.Context) {
	merchant := middleware.GetCurrentMerchant(c)
	if merchant == nil {
		response.Unauthorized(c, "Merchant session required")
		return
	}

	var req service.CreatePaymentLinkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid payment link request payload", err.Error())
		return
	}

	link, err := h.linkSvc.CreateLink(c.Request.Context(), merchant, &req)
	if err != nil {
		response.InternalServerError(c, "Failed to create payment link", err.Error())
		return
	}

	response.Success(c, http.StatusCreated, "Payment link created successfully", link)
}

// List returns all payment links owned by current merchant
func (h *PaymentLinkHandler) List(c *gin.Context) {
	merchant := middleware.GetCurrentMerchant(c)
	if merchant == nil {
		response.Unauthorized(c, "Merchant session required")
		return
	}

	links, err := h.linkSvc.ListMerchantLinks(c.Request.Context(), merchant.ID)
	if err != nil {
		response.InternalServerError(c, "Failed to list payment links", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Payment links retrieved", links)
}

// Toggle toggles link active status
func (h *PaymentLinkHandler) Toggle(c *gin.Context) {
	merchant := middleware.GetCurrentMerchant(c)
	if merchant == nil {
		response.Unauthorized(c, "Merchant session required")
		return
	}

	idParam := c.Param("id")
	linkID, err := uuid.Parse(idParam)
	if err != nil {
		response.BadRequest(c, "Invalid link UUID format", err.Error())
		return
	}

	link, err := h.linkSvc.ToggleLinkStatus(c.Request.Context(), merchant.ID, linkID)
	if err != nil {
		response.InternalServerError(c, "Failed to toggle link status", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Payment link status updated", link)
}

// GetBySlug public endpoint returning payment link metadata
func (h *PaymentLinkHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	link, err := h.linkSvc.GetLinkBySlug(c.Request.Context(), slug)
	if err != nil || link == nil {
		response.NotFound(c, "Payment link not found or inactive")
		return
	}

	response.Success(c, http.StatusOK, "Payment link retrieved", link)
}

// Pay handles customer payment submission on payment link, generating a fresh deposit invoice
func (h *PaymentLinkHandler) Pay(c *gin.Context) {
	slug := c.Param("slug")

	var req struct {
		Amount *decimal.Decimal `json:"amount"`
	}
	_ = c.ShouldBindJSON(&req)

	inv, err := h.linkSvc.GenerateInvoiceForLink(c.Request.Context(), slug, req.Amount)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "Invoice generated for payment link", inv)
}
