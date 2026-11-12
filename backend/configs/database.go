package configs

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"captain-gateway/internal/domain"
)

// InitDatabase initializes GORM connection and runs AutoMigration
func InitDatabase(cfg *Config) (*gorm.DB, error) {
	var dialector gorm.Dialector

	switch cfg.DatabaseDriver {
	case "postgres":
		dialector = postgres.Open(cfg.DatabaseURL)
	case "sqlite":
		if dir := filepath.Dir(cfg.DatabaseURL); dir != "" && dir != "." {
			_ = os.MkdirAll(dir, 0755)
		}
		dialector = sqlite.Open(cfg.DatabaseURL)
	default:
		return nil, fmt.Errorf("unsupported database driver: %s", cfg.DatabaseDriver)
	}

	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	}
	if cfg.AppEnv == "development" {
		gormConfig.Logger = logger.Default.LogMode(logger.Info)
	}

	db, err := gorm.Open(dialector, gormConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get sql.DB: %w", err)
	}

	// Connection Pooling
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Printf("[INFO] Connected to %s database successfully", cfg.DatabaseDriver)

	// Run AutoMigrations
	if err := db.AutoMigrate(
		&domain.Merchant{},
		&domain.Invoice{},
		&domain.BlockchainTransaction{},
		&domain.PayoutTransfer{},
	); err != nil {
		return nil, fmt.Errorf("failed to auto-migrate schema: %w", err)
	}

	log.Println("[INFO] AutoMigration completed successfully")
	return db, nil
}

