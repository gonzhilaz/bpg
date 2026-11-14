package worker

import (
	"context"
	"fmt"
	"log"
	"time"

	"gorm.io/gorm"

	"13c-gateway/internal/domain"
)

// PruneResult contains metrics from an invoice database pruning run
type PruneResult struct {
	EligibleCount int64     `json:"eligible_count"`
	PrunedCount   int64     `json:"pruned_count"`
	RetentionDays int       `json:"retention_days"`
	DryRun        bool      `json:"dry_run"`
	ExecutedAt    time.Time `json:"executed_at"`
}

// PrunerWorker manages automated historical invoice database hygiene
type PrunerWorker interface {
	PruneExpiredInvoices(ctx context.Context, retentionDays int, dryRun bool) (*PruneResult, error)
	Start(ctx context.Context, interval time.Duration, retentionDays int)
}

type prunerWorker struct {
	db *gorm.DB
}

// NewPrunerWorker creates a new automated database pruner
func NewPrunerWorker(db *gorm.DB) PrunerWorker {
	return &prunerWorker{db: db}
}

// PruneExpiredInvoices purges stale EXPIRED/CANCELLED invoices past retention window
func (w *prunerWorker) PruneExpiredInvoices(ctx context.Context, retentionDays int, dryRun bool) (*PruneResult, error) {
	if retentionDays <= 0 {
		retentionDays = 30 // Default 30 days retention
	}

	cutoff := time.Now().AddDate(0, 0, -retentionDays)

	// Filter strictly non-financial records: EXPIRED or CANCELLED only.
	// PAID, OVERPAID, UNDERPAID, and PENDING are strictly protected.
	query := w.db.WithContext(ctx).Model(&domain.Invoice{}).
		Where("status IN ? AND expires_at < ?", []domain.InvoiceStatus{domain.StatusExpired, domain.StatusCancelled}, cutoff)

	var eligibleCount int64
	if err := query.Count(&eligibleCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count prunable invoices: %w", err)
	}

	result := &PruneResult{
		EligibleCount: eligibleCount,
		RetentionDays: retentionDays,
		DryRun:        dryRun,
		ExecutedAt:    time.Now(),
	}

	if dryRun || eligibleCount == 0 {
		return result, nil
	}

	// Execute permanent delete for expired invoices beyond retention
	delResult := w.db.WithContext(ctx).
		Where("status IN ? AND expires_at < ?", []domain.InvoiceStatus{domain.StatusExpired, domain.StatusCancelled}, cutoff).
		Delete(&domain.Invoice{})

	if delResult.Error != nil {
		return nil, fmt.Errorf("failed to prune expired invoices: %w", delResult.Error)
	}

	result.PrunedCount = delResult.RowsAffected
	log.Printf("[DB PRUNER] Pruned %d stale expired invoices (retention: %d days)", result.PrunedCount, retentionDays)
	return result, nil
}

// Start launches background periodic cron pruner
func (w *prunerWorker) Start(ctx context.Context, interval time.Duration, retentionDays int) {
	if interval < 1*time.Hour {
		interval = 24 * time.Hour // Default daily run
	}

	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				_, err := w.PruneExpiredInvoices(context.Background(), retentionDays, false)
				if err != nil {
					log.Printf("[DB PRUNER ERROR] Periodic prune failed: %v", err)
				}
			}
		}
	}()
}
