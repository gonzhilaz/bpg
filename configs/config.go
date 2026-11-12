package configs

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all application configurations
type Config struct {
	ServerPort       string
	AppEnv           string
	MasterSecretKey  string // Key used for AES-256-GCM private key encryption
	DatabaseDriver   string // "postgres" or "sqlite"
	DatabaseURL      string
	InvoiceExpiryMin int

	// Blockchain RPCs
	BSCRPCURL        string
	PolygonRPCURL    string
	TronGridAPIURL   string
	TronAPIKey       string
	SolanaRPCURL     string
}

// LoadConfig reads config from environment variables and .env file
func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("[INFO] No .env file found, using system environment variables")
	}

	expiryMin, err := strconv.Atoi(getEnv("INVOICE_EXPIRY_MINUTES", "30"))
	if err != nil {
		expiryMin = 30
	}

	return &Config{
		ServerPort:       getEnv("SERVER_PORT", "8080"),
		AppEnv:           getEnv("APP_ENV", "development"),
		MasterSecretKey:  getEnv("MASTER_SECRET_KEY", "captain-default-master-secret-key-32bytes!"),
		DatabaseDriver:   getEnv("DB_DRIVER", "sqlite"),
		DatabaseURL:      getEnv("DATABASE_URL", "captain.db"),
		InvoiceExpiryMin: expiryMin,

		BSCRPCURL:      getEnv("BSC_RPC_URL", "https://bsc-dataseed.binance.org/"),
		PolygonRPCURL:  getEnv("POLYGON_RPC_URL", "https://polygon-rpc.com/"),
		TronGridAPIURL: getEnv("TRON_GRID_URL", "https://api.trongrid.io"),
		TronAPIKey:     getEnv("TRON_API_KEY", ""),
		SolanaRPCURL:   getEnv("SOLANA_RPC_URL", "https://api.mainnet-beta.solana.com"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
