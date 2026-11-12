package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"

	"captain-gateway/internal/domain"
	"captain-gateway/internal/handler"
	"captain-gateway/internal/middleware"
	"captain-gateway/internal/repository"
	"captain-gateway/internal/service"
)

func setupTestRouter(t *testing.T) (*gin.Engine, *gorm.DB) {
	gin.SetMode(gin.TestMode)

	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open in-memory db: %v", err)
	}

	err = db.AutoMigrate(
		&domain.Merchant{},
		&domain.Invoice{},
		&domain.BlockchainTransaction{},
		&domain.PayoutTransfer{},
	)
	if err != nil {
		t.Fatalf("failed to auto migrate: %v", err)
	}

	seedDefaultMerchant(db)

	merchantRepo := repository.NewMerchantRepository(db)
	invoiceRepo := repository.NewInvoiceRepository(db)
	txRepo := repository.NewTransactionRepository(db)

	rateSvc := service.NewRateService()
	invoiceSvc := service.NewInvoiceService(
		invoiceRepo,
		txRepo,
		rateSvc,
		"test-encryption-key-32bytes-long!",
		30,
	)

	healthHandler := handler.NewHealthHandler()
	merchantHandler := handler.NewMerchantHandler(merchantRepo)
	invoiceHandler := handler.NewInvoiceHandler(invoiceSvc)

	r := gin.New()
	r.Use(middleware.CORSMiddleware())

	r.GET("/health", healthHandler.Check)

	v1 := r.Group("/api/v1")
	{
		v1.POST("/merchants/register", merchantHandler.Register)
		v1.GET("/invoices/:id", invoiceHandler.GetByID)
		v1.POST("/invoices/simulate-payment", invoiceHandler.SimulatePayment)

		authorized := v1.Group("/")
		authorized.Use(middleware.APIKeyAuth(merchantRepo))
		{
			authorized.POST("/invoices", invoiceHandler.Create)
		}
	}

	return r, db
}

func TestHealthEndpoint(t *testing.T) {
	r, _ := setupTestRouter(t)

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", w.Code)
	}
}

func TestCreateAndPayInvoice(t *testing.T) {
	r, _ := setupTestRouter(t)

	// 1. Create Invoice on BSC
	createPayload := service.CreateInvoiceRequest{
		OrderID:     "ORD-1001",
		Amount:      decimal.NewFromFloat(15.50),
		Currency:    "USD",
		PayCurrency: "USDT",
		PayNetwork:  domain.NetworkBSC,
	}
	body, _ := json.Marshal(createPayload)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/invoices", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-KEY", "cap_demo_api_key_12345678")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected status 201, got %d: %s", w.Code, w.Body.String())
	}

	var createResp struct {
		Success bool                    `json:"success"`
		Data    service.InvoiceResponse `json:"data"`
	}
	_ = json.Unmarshal(w.Body.Bytes(), &createResp)

	invoice := createResp.Data
	if invoice.DepositAddress == "" {
		t.Fatal("expected deposit address to be generated, got empty")
	}
	if invoice.Status != domain.StatusPending {
		t.Fatalf("expected status PENDING, got %s", invoice.Status)
	}

	// 2. Fetch Invoice by ID (Public Customer Screen)
	getReq := httptest.NewRequest(http.MethodGet, "/api/v1/invoices/"+invoice.ID.String(), nil)
	getW := httptest.NewRecorder()
	r.ServeHTTP(getW, getReq)

	if getW.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", getW.Code)
	}

	// 3. Simulate Payment of Exact Amount
	simPayload := handler.SimulatePaymentRequest{
		DepositAddress: invoice.DepositAddress,
		Amount:         invoice.PayAmount,
		Network:        domain.NetworkBSC,
	}
	simBody, _ := json.Marshal(simPayload)

	simReq := httptest.NewRequest(http.MethodPost, "/api/v1/invoices/simulate-payment", bytes.NewReader(simBody))
	simReq.Header.Set("Content-Type", "application/json")
	simW := httptest.NewRecorder()
	r.ServeHTTP(simW, simReq)

	if simW.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", simW.Code, simW.Body.String())
	}

	// 4. Verify Invoice is now PAID
	checkReq := httptest.NewRequest(http.MethodGet, "/api/v1/invoices/"+invoice.ID.String(), nil)
	checkW := httptest.NewRecorder()
	r.ServeHTTP(checkW, checkReq)

	var checkResp struct {
		Success bool                    `json:"success"`
		Data    service.InvoiceResponse `json:"data"`
	}
	_ = json.Unmarshal(checkW.Body.Bytes(), &checkResp)

	if checkResp.Data.Status != domain.StatusPaid {
		t.Fatalf("expected invoice status PAID, got %s", checkResp.Data.Status)
	}
}
