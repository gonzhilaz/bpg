package handler

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"

	"github.com/gin-gonic/gin"

	"13c-gateway/internal/domain"
	"13c-gateway/internal/repository"
	"13c-gateway/pkg/response"
)

// MerchantHandler manages merchant profiles and payout addresses
type MerchantHandler struct {
	merchantRepo repository.MerchantRepository
}

// NewMerchantHandler creates a new MerchantHandler
func NewMerchantHandler(repo repository.MerchantRepository) *MerchantHandler {
	return &MerchantHandler{merchantRepo: repo}
}

// RegisterMerchantRequest payload for creating merchant
type RegisterMerchantRequest struct {
	Name                 string `json:"name" binding:"required"`
	PayoutAddressBSC     string `json:"payout_address_bsc"`
	PayoutAddressPolygon string `json:"payout_address_polygon"`
	PayoutAddressTron    string `json:"payout_address_tron"`
	PayoutAddressSolana  string `json:"payout_address_solana"`
	WebhookURL           string `json:"webhook_url"`
}

// Register creates a new merchant and issues API keys
func (h *MerchantHandler) Register(c *gin.Context) {
	var req RegisterMerchantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err.Error())
		return
	}

	apiKeyBytes := make([]byte, 24)
	secretKeyBytes := make([]byte, 32)
	_, _ = rand.Read(apiKeyBytes)
	_, _ = rand.Read(secretKeyBytes)

	merchant := &domain.Merchant{
		Name:                 req.Name,
		APIKey:               "cap_" + hex.EncodeToString(apiKeyBytes),
		SecretKey:            hex.EncodeToString(secretKeyBytes),
		PayoutAddressBSC:     req.PayoutAddressBSC,
		PayoutAddressPolygon: req.PayoutAddressPolygon,
		PayoutAddressTron:    req.PayoutAddressTron,
		PayoutAddressSolana:  req.PayoutAddressSolana,
		WebhookURL:           req.WebhookURL,
		AutoPayoutEnabled:   true,
	}

	if err := h.merchantRepo.Create(c.Request.Context(), merchant); err != nil {
		response.InternalServerError(c, "Failed to register merchant", err.Error())
		return
	}

	response.Success(c, http.StatusCreated, "Merchant registered successfully", merchant)
}

