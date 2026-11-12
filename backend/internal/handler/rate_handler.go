package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"captain-gateway/internal/service"
	"captain-gateway/pkg/response"
)

// RateHandler handles coin prices and network gas fee endpoints
type RateHandler struct {
	rateSvc service.RateService
}

// NewRateHandler creates a new RateHandler instance
func NewRateHandler(rateSvc service.RateService) *RateHandler {
	return &RateHandler{rateSvc: rateSvc}
}

// GetGasRates returns real-time coin prices and estimated gas fees per network
func (h *RateHandler) GetGasRates(c *gin.Context) {
	rates, err := h.rateSvc.GetNetworkGasRates(c.Request.Context())
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to retrieve network gas rates", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Network gas rates retrieved successfully", rates)
}

