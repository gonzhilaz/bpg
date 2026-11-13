package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"13c-gateway/internal/license"
	"13c-gateway/pkg/response"
)

// LicenseHandler provides endpoints to view status and activate software license
type LicenseHandler struct {
	defaultHeartbeatURL string
}

// NewLicenseHandler creates a new LicenseHandler instance
func NewLicenseHandler(defaultHeartbeatURL string) *LicenseHandler {
	return &LicenseHandler{defaultHeartbeatURL: defaultHeartbeatURL}
}

// GetStatus returns the current license state
func (h *LicenseHandler) GetStatus(c *gin.Context) {
	mgr := license.GetManager()
	status := mgr.GetStatus()
	response.Success(c, http.StatusOK, "License status", status)
}

// Activate applies a new signed license token to unlock the system
func (h *LicenseHandler) Activate(c *gin.Context) {
	var req struct {
		LicenseToken string `json:"license_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "License token is required", err.Error())
		return
	}

	mgr := license.GetManager()
	if err := mgr.VerifyAndActivate(req.LicenseToken, h.defaultHeartbeatURL); err != nil {
		response.BadRequest(c, "Activation failed: "+err.Error(), "")
		return
	}

	response.Success(c, http.StatusOK, "13C Gateway successfully licensed and activated!", mgr.GetStatus())
}

