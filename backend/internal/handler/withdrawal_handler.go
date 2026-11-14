package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"

	"13c-gateway/internal/domain"
	"13c-gateway/internal/middleware"
	"13c-gateway/internal/service"
	"13c-gateway/internal/twofactor"
	"13c-gateway/pkg/response"
)

// WithdrawalHandler manages escrow withdrawals and approvals
type WithdrawalHandler struct {
	withdrawalSvc service.WithdrawalService
}

// NewWithdrawalHandler creates a new WithdrawalHandler instance
func NewWithdrawalHandler(svc service.WithdrawalService) *WithdrawalHandler {
	return &WithdrawalHandler{withdrawalSvc: svc}
}

// CreateRequestPayload payload for merchant requesting withdrawal
type CreateRequestPayload struct {
	Amount        decimal.Decimal `json:"amount" binding:"required"`
	Network       domain.Network  `json:"network" binding:"required"`
	TargetAddress string          `json:"target_address" binding:"required"`
	TwoFactorCode string          `json:"two_factor_code"`
}

// RequestWithdrawal allows authenticated merchants to request payout from escrow
func (h *WithdrawalHandler) RequestWithdrawal(c *gin.Context) {
	merchant := middleware.GetCurrentMerchant(c)
	if merchant == nil {
		response.Unauthorized(c, "Merchant not authenticated")
		return
	}

	var req CreateRequestPayload
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid withdrawal request payload", err.Error())
		return
	}

	// 2FA Defense: If merchant has two-factor authentication enabled, require physical TOTP verification
	if merchant.TwoFactorEnabled {
		code := strings.TrimSpace(req.TwoFactorCode)
		if code == "" {
			code = strings.TrimSpace(c.GetHeader("X-2FA-Code"))
		}
		if code == "" || !twofactor.ValidateCode(merchant.TwoFactorSecret, code) {
			response.Forbidden(c, "Valid 6-digit TOTP code is required to withdraw escrow funds")
			return
		}
	}

	record, err := h.withdrawalSvc.RequestWithdrawal(c.Request.Context(), merchant.ID, req.Amount, req.Network, req.TargetAddress)
	if err != nil {
		response.BadRequest(c, err.Error(), "")
		return
	}

	response.Success(c, http.StatusCreated, "Withdrawal requested successfully", record)
}

// ListMerchantWithdrawals returns past withdrawal history for the merchant
func (h *WithdrawalHandler) ListMerchantWithdrawals(c *gin.Context) {
	merchant := middleware.GetCurrentMerchant(c)
	if merchant == nil {
		response.Unauthorized(c, "Merchant not authenticated")
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	records, total, err := h.withdrawalSvc.ListMerchantWithdrawals(c.Request.Context(), merchant.ID, limit, offset)
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve withdrawals", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Merchant withdrawals retrieved", gin.H{
		"withdrawals": records,
		"total":       total,
	})
}

// GetEscrowSummary returns available balance, locked balance, and minimum payout
func (h *WithdrawalHandler) GetEscrowSummary(c *gin.Context) {
	merchant := middleware.GetCurrentMerchant(c)
	if merchant == nil {
		response.Unauthorized(c, "Merchant not authenticated")
		return
	}

	summary, err := h.withdrawalSvc.GetMerchantEscrowSummary(c.Request.Context(), merchant.ID)
	if err != nil {
		response.InternalServerError(c, "Failed to get escrow summary", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Escrow balance summary", summary)
}

// AdminListWithdrawals returns all platform withdrawal requests
func (h *WithdrawalHandler) AdminListWithdrawals(c *gin.Context) {
	status := c.DefaultQuery("status", "ALL")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	records, total, err := h.withdrawalSvc.ListAllWithdrawals(c.Request.Context(), status, limit, offset)
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve withdrawal requests", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Platform withdrawal requests", gin.H{
		"withdrawals": records,
		"total":       total,
	})
}

// AdminApproveWithdrawal approves a pending request and marks completed
func (h *WithdrawalHandler) AdminApproveWithdrawal(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid withdrawal request UUID", err.Error())
		return
	}

	adminID := "admin@13cgateway.internal"
	record, err := h.withdrawalSvc.ApproveWithdrawal(c.Request.Context(), id, adminID)
	if err != nil {
		response.BadRequest(c, err.Error(), "")
		return
	}

	response.Success(c, http.StatusOK, "Withdrawal approved and processed", record)
}

// AdminRejectWithdrawal rejects a pending request and refunds merchant balance
func (h *WithdrawalHandler) AdminRejectWithdrawal(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid withdrawal request UUID", err.Error())
		return
	}

	var req struct {
		Reason string `json:"reason" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, "Reason is required for rejecting a withdrawal")
		return
	}

	adminID := "admin@13cgateway.internal"
	record, err := h.withdrawalSvc.RejectWithdrawal(c.Request.Context(), id, adminID, req.Reason)
	if err != nil {
		response.BadRequest(c, err.Error(), "")
		return
	}

	response.Success(c, http.StatusOK, "Withdrawal rejected and balance refunded", record)
}

