package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"13c-gateway/pkg/response"
)

// LicenseHandler provides endpoints to view status and activate software license
type LicenseHandler struct{}

// NewLicenseHandler creates a new LicenseHandler instance
func NewLicenseHandler() *LicenseHandler {
	return &LicenseHandler{}
}

// GetStatus returns the current license state (Permanent White-Label Sovereign Mode)
func (h *LicenseHandler) GetStatus(c *gin.Context) {
	status := gin.H{
		"status":        "PERPETUAL_ENTERPRISE",
		"model":         "White-Label Sovereign (Jual Putus)",
		"unrestricted":  true,
		"offline_grace": "UNLIMITED",
		"phone_home":    "DISABLED",
		"telemetry":     "ZERO",
		"ownership":     "Perpetual Commercial Ownership",
		"licensee":      "Enterprise Sovereign Owner",
		"tier":          "UNLIMITED_ENTERPRISE",
	}
	response.Success(c, http.StatusOK, "Sovereign License Status", status)
}

// Activate confirms the system is permanently unlocked in Sovereign White-Label mode
func (h *LicenseHandler) Activate(c *gin.Context) {
	response.Success(c, http.StatusOK, "13C Gateway is permanently unlocked in Sovereign White-Label mode. No activation required.", gin.H{
		"status":       "PERPETUAL_ENTERPRISE",
		"unrestricted": true,
	})
}
