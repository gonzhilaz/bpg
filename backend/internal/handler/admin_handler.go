package handler

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"

	"13c-gateway/internal/domain"
	"13c-gateway/internal/payout"
	"13c-gateway/internal/repository"
	"13c-gateway/pkg/response"
)

// AdminHandler handles platform management, devops, database, and financial audit endpoints
type AdminHandler struct {
	db           *gorm.DB
	merchantRepo repository.MerchantRepository
	invoiceRepo  repository.InvoiceRepository
	payoutSvc    payout.PayoutService
}

// NewAdminHandler creates a new AdminHandler instance
func NewAdminHandler(
	db *gorm.DB,
	merchantRepo repository.MerchantRepository,
	invoiceRepo repository.InvoiceRepository,
	payoutSvc payout.PayoutService,
) *AdminHandler {
	return &AdminHandler{
		db:           db,
		merchantRepo: merchantRepo,
		invoiceRepo:  invoiceRepo,
		payoutSvc:    payoutSvc,
	}
}

// GetDatabaseHealth returns connection pool statistics and row counts
func (h *AdminHandler) GetDatabaseHealth(c *gin.Context) {
	var sqlDB *sql.DB
	var err error
	if h.db != nil {
		sqlDB, err = h.db.DB()
	}

	stats := gin.H{
		"status":      "HEALTHY",
		"driver":      h.db.Dialector.Name(),
		"open_conn":   0,
		"in_use":      0,
		"idle":        0,
		"max_open":    0,
	}

	if err == nil && sqlDB != nil {
		dbStats := sqlDB.Stats()
		stats["open_conn"] = dbStats.OpenConnections
		stats["in_use"] = dbStats.InUse
		stats["idle"] = dbStats.Idle
		stats["max_open"] = dbStats.MaxOpenConnections
	}

	var merchantCount, invoiceCount, payoutCount, txCount int64
	h.db.Model(&domain.Merchant{}).Count(&merchantCount)
	h.db.Model(&domain.Invoice{}).Count(&invoiceCount)
	h.db.Model(&domain.PayoutTransfer{}).Count(&payoutCount)
	h.db.Model(&domain.BlockchainTransaction{}).Count(&txCount)

	stats["row_counts"] = gin.H{
		"merchants":    merchantCount,
		"invoices":     invoiceCount,
		"payouts":      payoutCount,
		"transactions": txCount,
	}

	response.Success(c, http.StatusOK, "Database health and statistics", stats)
}

// PruneExpiredInvoices deletes expired invoices older than specified days
func (h *AdminHandler) PruneExpiredInvoices(c *gin.Context) {
	daysStr := c.DefaultQuery("days", "7")
	days, _ := strconv.Atoi(daysStr)
	if days <= 0 {
		days = 7
	}

	cutoff := time.Now().AddDate(0, 0, -days)
	result := h.db.Where("status = ? AND created_at < ?", domain.StatusExpired, cutoff).Delete(&domain.Invoice{})
	if result.Error != nil {
		response.InternalServerError(c, "Failed to prune expired records", result.Error.Error())
		return
	}

	response.Success(c, http.StatusOK, "Pruned expired invoices", gin.H{
		"pruned_count": result.RowsAffected,
		"older_than":   cutoff.Format(time.RFC3339),
	})
}

// TriggerManualSweep force-sweeps funds from deposit address to merchant cold wallet
func (h *AdminHandler) TriggerManualSweep(c *gin.Context) {
	var req struct {
		InvoiceID string `json:"invoice_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	id, err := uuid.Parse(req.InvoiceID)
	if err != nil {
		response.BadRequest(c, "Invalid invoice UUID", err.Error())
		return
	}

	invoice, err := h.invoiceRepo.GetByID(c.Request.Context(), id)
	if err != nil || invoice == nil {
		response.NotFound(c, "Invoice not found")
		return
	}

	payoutRecord, err := h.payoutSvc.ProcessManualSweep(c.Request.Context(), invoice)
	if err != nil {
		response.InternalServerError(c, "Manual sweep failed", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Manual sweep completed successfully", payoutRecord)
}

// GetFinancialReports provides aggregate accounting and revenue numbers
func (h *AdminHandler) GetFinancialReports(c *gin.Context) {
	var invoices []domain.Invoice
	h.db.Where("status = ?", domain.StatusPaid).Find(&invoices)

	totalGross := decimal.Zero
	for _, inv := range invoices {
		totalGross = totalGross.Add(inv.PayAmount)
	}

	// 0.4% platform fee cut
	platformFeeRate := decimal.NewFromFloat(0.004)
	platformRevenue := totalGross.Mul(platformFeeRate).Round(2)
	netMerchantSettled := totalGross.Sub(platformRevenue)

	var payoutsCount int64
	h.db.Model(&domain.PayoutTransfer{}).Count(&payoutsCount)
	estGasExpenses := decimal.NewFromInt(payoutsCount).Mul(decimal.NewFromFloat(0.02)).Round(2)
	netProfit := platformRevenue.Sub(estGasExpenses)

	response.Success(c, http.StatusOK, "Financial reports summary", gin.H{
		"total_invoices_paid":    len(invoices),
		"gross_volume_usd":       totalGross.StringFixed(2),
		"platform_fee_cut_usd":   platformRevenue.StringFixed(2),
		"net_merchant_settled":   netMerchantSettled.StringFixed(2),
		"payouts_completed":      payoutsCount,
		"est_gas_expenses_usd":   estGasExpenses.StringFixed(2),
		"net_gateway_profit_usd": netProfit.StringFixed(2),
	})
}

// ListMerchants returns all registered merchants with audit metrics
func (h *AdminHandler) ListMerchants(c *gin.Context) {
	merchants, total, err := h.merchantRepo.List(c.Request.Context(), 50, 0)
	if err != nil {
		response.InternalServerError(c, "Failed to list merchants", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Merchants list", gin.H{
		"merchants": merchants,
		"total":     total,
	})
}

// UpdateMerchantStatus toggles merchant active/suspended state
func (h *AdminHandler) UpdateMerchantStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		response.BadRequest(c, "Invalid merchant UUID", err.Error())
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"` // "ACTIVE" or "SUSPENDED"
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	merchant, err := h.merchantRepo.GetByID(c.Request.Context(), id)
	if err != nil || merchant == nil {
		response.NotFound(c, "Merchant not found")
		return
	}

	merchant.Status = req.Status
	if err := h.merchantRepo.Update(c.Request.Context(), merchant); err != nil {
		response.InternalServerError(c, "Failed to update status", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Merchant status updated", merchant)
}
