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
	"github.com/shopspring/decimal"
	"gorm.io/gorm"

	"13c-gateway/configs"
	"13c-gateway/internal/crypto"
	"13c-gateway/internal/domain"
	"13c-gateway/internal/handler"
	"13c-gateway/internal/license"
	"13c-gateway/internal/middleware"
	"13c-gateway/internal/payout"
	"13c-gateway/internal/repository"
	"13c-gateway/internal/service"
	"13c-gateway/internal/tronenergy"
	"13c-gateway/internal/watcher"
	"13c-gateway/internal/webhook"
	"13c-gateway/internal/worker"
)

func main() {
	log.Println("[INFO] Starting 13C Crypto Payment Gateway...")

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

	// Initialize License Engine & Remote Kill-Switch
	watcherCtx, cancelWatchers := context.WithCancel(context.Background())
	licenseMgr := license.GetManager()
	if err := licenseMgr.VerifyAndActivate(cfg.LicenseKey, cfg.LicenseServerURL); err != nil {
		log.Printf("[LICENSE WARN] Gateway starting in UNLICENSED mode: %v", err)
	}
	licenseMgr.StartHeartbeatDaemon(watcherCtx)
	licenseHandler := handler.NewLicenseHandler(cfg.LicenseServerURL)

	// Initialize Repositories
	merchantRepo := repository.NewMerchantRepository(db)
	invoiceRepo := repository.NewInvoiceRepository(db)
	txRepo := repository.NewTransactionRepository(db)
	payoutRepo := repository.NewPayoutRepository(db)
	withdrawalRepo := repository.NewWithdrawalRepository(db)
	paymentLinkRepo := repository.NewPaymentLinkRepository(db)

	// Initialize Services
	rateSvc := service.NewRateService()
	payoutSvc := payout.NewPayoutService(payoutRepo)
	webhookDispatcher := webhook.NewDispatcher()
	withdrawalSvc := service.NewWithdrawalService(withdrawalRepo, merchantRepo)
	energyRentalSvc := tronenergy.NewEnergyRentalService(cfg.TronEnergyRentalEnabled, cfg.TronEnergyProvider, "")
	log.Printf("[TRON ENERGY] Initialized rental service (enabled=%v, provider=%s)", energyRentalSvc.IsRentalEnabled(), cfg.TronEnergyProvider)

	invoiceSvc := service.NewInvoiceService(
		invoiceRepo,
		txRepo,
		rateSvc,
		payoutSvc,
		webhookDispatcher,
		cfg.MasterSecretKey,
		cfg.InvoiceExpiryMin,
	)
	invoiceSvc.SetWithdrawalRepo(withdrawalRepo)
	invoiceSvc.SetPaymentLinkRepo(paymentLinkRepo)
	invoiceSvc.SetUnderpaidTolerance(decimal.NewFromFloat(cfg.UnderpaidTolerancePercent))
	invoiceSvc.SetGracePeriod(time.Duration(cfg.InvoiceGracePeriodMin) * time.Minute)

	paymentLinkSvc := service.NewPaymentLinkService(paymentLinkRepo, merchantRepo, invoiceSvc)

	// Initialize Multi-Chain Background Watchers (BSC, Polygon, TRON, Solana)
	watcherManager := watcher.NewWatcherManager(cfg, invoiceRepo, invoiceSvc)
	watcherManager.Start(watcherCtx)

	// Initialize Automated Historical Database Pruner Worker (30 days retention)
	prunerWorker := worker.NewPrunerWorker(db)
	prunerWorker.Start(watcherCtx, 24*time.Hour, 30)

	// Initialize Handlers
	healthHandler := handler.NewHealthHandler()
	invoiceHandler := handler.NewInvoiceHandler(invoiceSvc)
	rateHandler := handler.NewRateHandler(rateSvc)
	authSvc := service.NewAuthService(merchantRepo, cfg.JWTSecret)
	authHandler := handler.NewAuthHandler(authSvc)
	adminHandler := handler.NewAdminHandler(db, merchantRepo, invoiceRepo, payoutSvc)
	withdrawalHandler := handler.NewWithdrawalHandler(withdrawalSvc)
	paymentLinkHandler := handler.NewPaymentLinkHandler(paymentLinkSvc)
	webhookHandler := handler.NewWebhookHandler(webhookDispatcher)

	// Setup Router
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery(), middleware.CORSMiddleware(), middleware.LicenseEnforcement())

	// Public Health Endpoint
	r.GET("/health", healthHandler.Check)

	// Swagger Interactive Documentation
	r.GET("/swagger/openapi.json", func(c *gin.Context) {
		c.File("docs/openapi.json")
	})
	r.GET("/swagger", func(c *gin.Context) {
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.String(http.StatusOK, swaggerHTML)
	})

	// API Routes
	v1 := r.Group("/api/v1")
	{
		// System Licensing & Activation
		v1.GET("/license/status", licenseHandler.GetStatus)
		v1.POST("/license/activate", licenseHandler.Activate)

		// Authentication (Self-service merchant onboarding & login)
		authRoutes := v1.Group("/auth")
		{
			authRoutes.POST("/register", authHandler.Register)
			authRoutes.POST("/login", authHandler.Login)
			authProtected := authRoutes.Group("/")
			authProtected.Use(middleware.JWTAuth(cfg.JWTSecret, merchantRepo))
			{
				authProtected.GET("/me", authHandler.Me)
				authProtected.POST("/regenerate-key", authHandler.RegenerateKey)
				authProtected.GET("/escrow/summary", withdrawalHandler.GetEscrowSummary)
				authProtected.POST("/withdrawals", withdrawalHandler.RequestWithdrawal)
				authProtected.GET("/withdrawals", withdrawalHandler.ListMerchantWithdrawals)

				// 2FA Management Endpoints
				authProtected.POST("/2fa/setup", authHandler.Setup2FA)
				authProtected.POST("/2fa/verify", authHandler.Verify2FA)
				authProtected.POST("/2fa/disable", authHandler.Disable2FA)

				// No-Code Payment Links
				authProtected.GET("/payment-links", paymentLinkHandler.List)
				authProtected.POST("/payment-links", paymentLinkHandler.Create)
				authProtected.PATCH("/payment-links/:id/toggle", paymentLinkHandler.Toggle)

				// Webhook Replay & Diagnostics
				authProtected.POST("/webhooks/test", webhookHandler.TestDispatch)
			}
		}

		// Public Checkout & Payment Link Endpoints
		v1.GET("/invoices/:id", invoiceHandler.GetByID)
		v1.GET("/invoices/:id/events", invoiceHandler.StreamEvents)
		v1.GET("/rates/gas", rateHandler.GetGasRates)
		v1.GET("/pay/:slug", paymentLinkHandler.GetBySlug)
		v1.POST("/pay/:slug/invoice", paymentLinkHandler.Pay)

		// Sandbox Simulation Endpoint (for dev/testing)
		v1.POST("/invoices/simulate-payment", invoiceHandler.SimulatePayment)

		// Financial Reports (Public or session-scoped summary)
		v1.GET("/reports/financial", adminHandler.GetFinancialReports)

		// Platform Dev & DevOps Admin Routes (Protected by Root Admin Auth)
		adminRoutes := v1.Group("/admin")
		adminRoutes.Use(middleware.AdminAuth(cfg.MasterSecretKey))
		{
			adminRoutes.GET("/database/health", adminHandler.GetDatabaseHealth)
			adminRoutes.POST("/database/prune", adminHandler.PruneExpiredInvoices)
			adminRoutes.POST("/sweeps/manual", adminHandler.TriggerManualSweep)
			adminRoutes.GET("/merchants", adminHandler.ListMerchants)
			adminRoutes.PUT("/merchants/:id/status", adminHandler.UpdateMerchantStatus)
			adminRoutes.GET("/withdrawals", withdrawalHandler.AdminListWithdrawals)
			adminRoutes.POST("/withdrawals/:id/approve", withdrawalHandler.AdminApproveWithdrawal)
			adminRoutes.POST("/withdrawals/:id/reject", withdrawalHandler.AdminRejectWithdrawal)
		}

		// Protected Merchant Invoicing (API Key Auth)
		authorized := v1.Group("/")
		authorized.Use(middleware.APIKeyAuth(merchantRepo))
		{
			authorized.POST("/invoices", invoiceHandler.Create)
			authorized.GET("/escrow/summary", withdrawalHandler.GetEscrowSummary)
			authorized.POST("/withdrawals", withdrawalHandler.RequestWithdrawal)
			authorized.GET("/withdrawals", withdrawalHandler.ListMerchantWithdrawals)
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
			Email:                "demo@13c.local",
			Name:                 "13C Demo Store",
			Role:                 "admin",
			Status:               "ACTIVE",
			APIKey:               "13c_demo_api_key_12345678",
			APIKeyHash:           crypto.HashSHA256("13c_demo_api_key_12345678"),
			APIKeyPrefix:         "13c_demo_...",
			SecretKey:            "13c_demo_secret_key_87654321",
			PayoutAddressBSC:     "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
			PayoutAddressPolygon: "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
			PayoutAddressTron:    "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa",
			PayoutAddressSolana:  "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
			AutoPayoutEnabled:   true,
			FeePayer:             "customer",
			SettlementMode:       "INSTANT_FORWARD",
			WebhookURL:          "http://localhost:3000/api/webhooks/crypto",
		}
		db.Create(&defaultMerchant)
		log.Println("[INFO] Seeded default merchant with API Key: 13c_demo_api_key_12345678")
	}
}

const swaggerHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>13C Crypto Payment Gateway API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5.11.0/favicon-32x32.png" />
  <style>
    body { margin: 0; background: #0b0e14; }
    .swagger-ui { filter: invert(88%) hue-rotate(180deg); }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/swagger/openapi.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`
