package handler

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"

	"13c-gateway/internal/domain"
	"13c-gateway/internal/middleware"
	"13c-gateway/internal/service"
	"13c-gateway/pkg/response"
)

// AuthHandler handles authentication routes
type AuthHandler struct {
	authSvc service.AuthService
	db      *gorm.DB
}

// NewAuthHandler creates AuthHandler instance
func NewAuthHandler(authSvc service.AuthService, db *gorm.DB) *AuthHandler {
	return &AuthHandler{authSvc: authSvc, db: db}
}

// Register handles new merchant self-service onboarding
func (h *AuthHandler) Register(c *gin.Context) {
	var req service.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	authResp, err := h.authSvc.Register(c.Request.Context(), &req)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "Merchant registered successfully. Save your API Key now (it will not be shown again).", authResp)
}

// Login handles merchant or admin sign-in
func (h *AuthHandler) Login(c *gin.Context) {
	var req service.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	authResp, err := h.authSvc.Login(c.Request.Context(), &req)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}

	if authResp.Require2FA {
		response.Success(c, http.StatusOK, "2FA verification required", authResp)
		return
	}

	// Set HttpOnly secure cookie for web sessions
	c.SetCookie("access_token", authResp.Token, 86400, "/", "", false, true)
	response.Success(c, http.StatusOK, "Login successful", authResp)
}

// Setup2FA initiates TOTP setup and returns secret and otpauth URI
func (h *AuthHandler) Setup2FA(c *gin.Context) {
	merchant := middleware.GetCurrentMerchant(c)
	if merchant == nil {
		response.Unauthorized(c, "Session not found")
		return
	}

	setup, err := h.authSvc.Setup2FA(c.Request.Context(), merchant.ID)
	if err != nil {
		response.InternalServerError(c, "Failed to initiate 2FA setup", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "2FA setup initiated", setup)
}

// Verify2FA validates 6-digit code and activates 2FA
func (h *AuthHandler) Verify2FA(c *gin.Context) {
	merchant := middleware.GetCurrentMerchant(c)
	if merchant == nil {
		response.Unauthorized(c, "Session not found")
		return
	}

	var req struct {
		Code string `json:"code" binding:"required,len=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid 6-digit code format", err.Error())
		return
	}

	success, err := h.authSvc.Verify2FA(c.Request.Context(), merchant.ID, req.Code)
	if err != nil || !success {
		response.BadRequest(c, "Invalid 2FA verification code", nil)
		return
	}

	response.Success(c, http.StatusOK, "Two-Factor Authentication activated successfully", gin.H{"two_factor_enabled": true})
}

// Disable2FA disables TOTP protection
func (h *AuthHandler) Disable2FA(c *gin.Context) {
	merchant := middleware.GetCurrentMerchant(c)
	if merchant == nil {
		response.Unauthorized(c, "Session not found")
		return
	}

	var req struct {
		Password string `json:"password" binding:"required"`
		Code     string `json:"code" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Password and 6-digit code are required", err.Error())
		return
	}

	success, err := h.authSvc.Disable2FA(c.Request.Context(), merchant.ID, req.Password, req.Code)
	if err != nil || !success {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Two-Factor Authentication disabled", gin.H{"two_factor_enabled": false})
}

// Me returns the currently authenticated merchant profile
func (h *AuthHandler) Me(c *gin.Context) {
	merchant := middleware.GetCurrentMerchant(c)
	if merchant == nil {
		response.Unauthorized(c, "Session not found")
		return
	}
	response.Success(c, http.StatusOK, "Current merchant profile", merchant)
}

// RegenerateKey generates and rotates API credentials for authenticated merchant
func (h *AuthHandler) RegenerateKey(c *gin.Context) {
	merchant := middleware.GetCurrentMerchant(c)
	if merchant == nil {
		response.Unauthorized(c, "Session not found")
		return
	}

	result, err := h.authSvc.RegenerateAPIKey(c.Request.Context(), merchant.ID)
	if err != nil {
		response.InternalServerError(c, "Failed to rotate API Key", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "API Key rotated successfully. Save it now.", result)
}

// UpdateProfile updates authenticated merchant settings
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	merchant := middleware.GetCurrentMerchant(c)
	if merchant == nil {
		response.Unauthorized(c, "Session not found")
		return
	}

	var req service.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err.Error())
		return
	}

	updated, err := h.authSvc.UpdateProfile(c.Request.Context(), merchant.ID, &req)
	if err != nil {
		response.InternalServerError(c, "Failed to update profile", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Profile updated successfully", updated)
}

// GetLedger computes real accounting metrics from database transactions
func (h *AuthHandler) GetLedger(c *gin.Context) {
	merchant := middleware.GetCurrentMerchant(c)
	if merchant == nil {
		response.Unauthorized(c, "Session not found")
		return
	}

	dateRange := c.DefaultQuery("range", "30D")
	var cutoff time.Time
	now := time.Now()

	switch strings.ToUpper(dateRange) {
	case "7D":
		cutoff = now.AddDate(0, 0, -7)
	case "30D":
		cutoff = now.AddDate(0, 0, -30)
	default:
		cutoff = time.Time{}
	}

	query := h.db.WithContext(c.Request.Context()).Model(&domain.Invoice{}).
		Where("merchant_id = ? AND status = ?", merchant.ID, domain.StatusPaid)
	if !cutoff.IsZero() {
		query = query.Where("created_at >= ?", cutoff)
	}

	var invoices []domain.Invoice
	if err := query.Find(&invoices).Error; err != nil {
		response.InternalServerError(c, "Failed to calculate ledger", err.Error())
		return
	}

	grossVolume := decimal.Zero
	platformFee := decimal.Zero
	for _, inv := range invoices {
		grossVolume = grossVolume.Add(inv.PayAmount)
		fee := inv.PayAmount.Mul(decimal.NewFromFloat(0.004)).Round(4)
		platformFee = platformFee.Add(fee)
	}
	netSettled := grossVolume.Sub(platformFee)

	var payoutsCount int64
	payoutQuery := h.db.WithContext(c.Request.Context()).Model(&domain.PayoutTransfer{}).
		Where("merchant_id = ? AND status = ?", merchant.ID, "CONFIRMED")
	if !cutoff.IsZero() {
		payoutQuery = payoutQuery.Where("created_at >= ?", cutoff)
	}
	_ = payoutQuery.Count(&payoutsCount)

	gasSpent := decimal.NewFromInt(payoutsCount).Mul(decimal.NewFromFloat(0.02)).Round(4)

	avgOrder := decimal.Zero
	if len(invoices) > 0 {
		avgOrder = grossVolume.Div(decimal.NewFromInt(int64(len(invoices)))).Round(2)
	}

	response.Success(c, http.StatusOK, "Merchant financial ledger", gin.H{
		"range":         dateRange,
		"gross_volume":  "$" + grossVolume.StringFixed(2),
		"net_settled":   "$" + netSettled.StringFixed(2),
		"platform_fee":  "$" + platformFee.StringFixed(2),
		"gas_fees_paid": "$" + gasSpent.StringFixed(2),
		"payouts_count": len(invoices),
		"avg_order":     "$" + avgOrder.StringFixed(2),
	})
}
