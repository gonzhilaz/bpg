package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"captain-gateway/configs"
	"captain-gateway/internal/domain"
	"captain-gateway/internal/handler"
	"captain-gateway/internal/middleware"
	"captain-gateway/internal/payout"
	"captain-gateway/internal/repository"
	"captain-gateway/internal/service"
	"captain-gateway/internal/watcher"
	"captain-gateway/internal/webhook"
)

func main() {
	log.Println("[INFO] Starting Captain Crypto Payment Gateway...")

	cfg := configs.LoadConfig()
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	db, err := configs.InitDatabase(cfg)
	if err != nil {
		log.Fatalf("[FATAL] Database initialization failed: %v", err)
	}

	// Seed default merchant for instant testing if table is empty
	seedDefaultMerchant(db)

	// Initialize Repositories
	merchantRepo := repository.NewMerchantRepository(db)
	invoiceRepo := repository.NewInvoiceRepository(db)
	txRepo := repository.NewTransactionRepository(db)
	payoutRepo := repository.NewPayoutRepository(db)

	// Initialize Services
	rateSvc := service.NewRateService()
	payoutSvc := payout.NewPayoutService(payoutRepo)
	webhookDispatcher := webhook.NewDispatcher()

	invoiceSvc := service.NewInvoiceService(
		invoiceRepo,
		txRepo,
		rateSvc,
		payoutSvc,
		webhookDispatcher,
		cfg.MasterSecretKey,
		cfg.InvoiceExpiryMin,
	)

	// Initialize Multi-Chain Background Watchers (BSC, Polygon, TRON, Solana)
	watcherCtx, cancelWatchers := context.WithCancel(context.Background())
	watcherManager := watcher.NewWatcherManager(cfg, invoiceRepo, invoiceSvc)
	watcherManager.Start(watcherCtx)

	// Initialize Handlers
	healthHandler := handler.NewHealthHandler()
	merchantHandler := handler.NewMerchantHandler(merchantRepo)
	invoiceHandler := handler.NewInvoiceHandler(invoiceSvc)

	// Setup Router
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery(), middleware.CORSMiddleware())

	// Public Health Endpoint
	r.GET("/health", healthHandler.Check)

	// API Routes
	v1 := r.Group("/api/v1")
	{
		// Merchant Registration
		v1.POST("/merchants/register", merchantHandler.Register)

		// Public Checkout Endpoints (for Customer Payment Screens)
		v1.GET("/invoices/:id", invoiceHandler.GetByID)

		// Sandbox Simulation Endpoint (for dev/testing)
		v1.POST("/invoices/simulate-payment", invoiceHandler.SimulatePayment)

		// Protected Merchant Endpoints
		authorized := v1.Group("/")
		authorized.Use(middleware.APIKeyAuth(merchantRepo))
		{
			authorized.POST("/invoices", invoiceHandler.Create)
		}
	}

	srv := &http.Server{
		Addr:         ":" + cfg.ServerPort,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	// Start HTTP Server
	go func() {
		log.Printf("[INFO] Server listening on http://localhost:%s\n", cfg.ServerPort)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[FATAL] Listen error: %v", err)
		}
	}()

	// Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("[INFO] Shutting down server gracefully...")

	// 1. Stop background watchers
	cancelWatchers()
	watcherManager.Stop()

	// 2. Shutdown HTTP server
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("[FATAL] Server forced to shutdown: %v", err)
	}

	log.Println("[INFO] Server exited successfully.")
}

func seedDefaultMerchant(db *gorm.DB) {
	var count int64
	db.Model(&domain.Merchant{}).Count(&count)
	if count == 0 {
		defaultMerchant := domain.Merchant{
			Name:                 "Captain Demo Store",
			APIKey:               "cap_demo_api_key_12345678",
			SecretKey:            "cap_demo_secret_key_87654321",
			PayoutAddressBSC:     "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
			PayoutAddressPolygon: "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
			PayoutAddressTron:    "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa",
			PayoutAddressSolana:  "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
			AutoPayoutEnabled:   true,
			WebhookURL:          "http://localhost:3000/api/webhooks/crypto",
		}
		db.Create(&defaultMerchant)
		log.Println("[INFO] Seeded default merchant with API Key: cap_demo_api_key_12345678")
	}
}
