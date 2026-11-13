package watcher

import (
	"context"
	"log"
	"sync"
	"time"

	"13c-gateway/configs"
	"13c-gateway/internal/domain"
	"13c-gateway/internal/repository"
	"13c-gateway/internal/service"
)

// WatcherManager orchestrates multi-chain indexers concurrently
type WatcherManager struct {
	watchers []NetworkWatcher
	invRepo  repository.InvoiceRepository
	interval time.Duration
	cancel   context.CancelFunc
	wg       sync.WaitGroup
}

// NewWatcherManager initializes all 4 network indexers
func NewWatcherManager(
	cfg *configs.Config,
	invRepo repository.InvoiceRepository,
	invoiceSvc service.InvoiceService,
) *WatcherManager {
	bscRPC := cfg.BSCRPCURL
	polyRPC := cfg.PolygonRPCURL
	tronGrid := cfg.TronGridAPIURL
	solRPC := cfg.SolanaRPCURL

	// Dynamic testnet / sandbox RPC switching
	if cfg.AppEnv == "sandbox" || cfg.AppEnv == "testnet" || cfg.AppEnv == "development" {
		if cfg.TestnetBSCRPC != "" {
			bscRPC = cfg.TestnetBSCRPC
		}
		if cfg.TestnetPolygonRPC != "" {
			polyRPC = cfg.TestnetPolygonRPC
		}
		if cfg.TestnetTronGridURL != "" {
			tronGrid = cfg.TestnetTronGridURL
		}
		if cfg.TestnetSolanaRPC != "" {
			solRPC = cfg.TestnetSolanaRPC
		}
	}

	watchers := []NetworkWatcher{
		// BSC EVM Indexer (USDT 18 Decimals)
		NewEVMWatcher(domain.NetworkBSC, bscRPC, BSC_USDT_CONTRACT, 18, invRepo, invoiceSvc),
		// Polygon EVM Indexer (USDT 6 Decimals)
		NewEVMWatcher(domain.NetworkPolygon, polyRPC, POLYGON_USDT_CONTRACT, 6, invRepo, invoiceSvc),
		// TRON Indexer (USDT TRC-20 6 Decimals)
		NewTronWatcher(tronGrid, cfg.TronAPIKey, invRepo, invoiceSvc),
		// Solana Indexer (USDT/USDC SPL 6 Decimals)
		NewSolanaWatcher(solRPC, invRepo, invoiceSvc),
	}

	return &WatcherManager{
		watchers: watchers,
		invRepo:  invRepo,
		interval: 5 * time.Second, // Scan every 5 seconds
	}
}

// Start launches background indexer goroutines
func (m *WatcherManager) Start(ctx context.Context) {
	ctx, cancel := context.WithCancel(ctx)
	m.cancel = cancel

	log.Printf("[WATCHER] Starting %d multi-chain indexers (BSC, Polygon, TRON, Solana)...", len(m.watchers))

	for _, w := range m.watchers {
		m.wg.Add(1)
		go m.runWatcherLoop(ctx, w)
	}

	// Expiration cleaner goroutine (runs every 1 minute)
	m.wg.Add(1)
	go m.runExpiryCleaner(ctx)
}

func (m *WatcherManager) runWatcherLoop(ctx context.Context, w NetworkWatcher) {
	defer m.wg.Done()
	ticker := time.NewTicker(m.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Printf("[WATCHER] Stopping indexer for %s", w.Network())
			return
		case <-ticker.C:
			if err := w.ScanBlocks(ctx); err != nil {
				// Log but do not crash background daemon
				log.Printf("[WATCHER ERROR] %s scan failed: %v", w.Network(), err)
			}
		}
	}
}

func (m *WatcherManager) runExpiryCleaner(ctx context.Context) {
	defer m.wg.Done()
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			affected, err := m.invRepo.ExpireOverdueInvoices(ctx, time.Now())
			if err == nil && affected > 0 {
				log.Printf("[WATCHER] Expired %d overdue invoices", affected)
			}
		}
	}
}

// Stop gracefully stops all background indexers
func (m *WatcherManager) Stop() {
	if m.cancel != nil {
		m.cancel()
	}
	m.wg.Wait()
	log.Println("[WATCHER] All multi-chain indexers stopped gracefully.")
}

