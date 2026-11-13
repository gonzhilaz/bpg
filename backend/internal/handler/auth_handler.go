package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"13c-gateway/internal/middleware"
	"13c-gateway/internal/service"
	"13c-gateway/pkg/response"
)

// AuthHandler handles authentication routes
type AuthHandler struct {
	authSvc service.AuthService
}

// NewAuthHandler creates AuthHandler instance
func NewAuthHandler(authSvc service.AuthService) *AuthHandler {
	return &AuthHandler{authSvc: authSvc}
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

	// Set HttpOnly secure cookie for web sessions
	c.SetCookie("access_token", authResp.Token, 86400, "/", "", false, true)
	response.Success(c, http.StatusOK, "Login successful", authResp)
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
