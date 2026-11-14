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
	InvoiceGracePeriodMin int
	UnderpaidTolerancePercent float64
	JWTSecret        string

	// Software Licensing & Kill-Switch
	LicenseKey       string
	LicenseServerURL string

	// Blockchain RPCs (Mainnet)
	BSCRPCURL        string
	PolygonRPCURL    string
	TronGridAPIURL   string
	TronAPIKey       string
	SolanaRPCURL     string

	// Blockchain RPCs (Testnet)
	TestnetBSCRPC    string
	TestnetPolygonRPC string
	TestnetTronGridURL string
	TestnetSolanaRPC string
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

	graceMin, err := strconv.Atoi(getEnv("INVOICE_GRACE_PERIOD_MINUTES", "15"))
	if err != nil || graceMin < 0 {
		graceMin = 15
	}

	underpaidTol, err := strconv.ParseFloat(getEnv("UNDERPAID_TOLERANCE_PERCENT", "0.0"), 64)
	if err != nil || underpaidTol < 0 {
		underpaidTol = 0.0
	} else if underpaidTol > 100.0 {
		underpaidTol = 100.0
	}

	return &Config{
		ServerPort:                getEnv("SERVER_PORT", "8080"),
		AppEnv:                    getEnv("APP_ENV", "development"),
		MasterSecretKey:           getEnv("MASTER_SECRET_KEY", "13c-default-master-secret-key-32bytes!"),
		DatabaseDriver:            getEnv("DB_DRIVER", "sqlite"),
		DatabaseURL:               getEnv("DATABASE_URL", "data/13c.db"),
		InvoiceExpiryMin:          expiryMin,
		InvoiceGracePeriodMin:     graceMin,
		UnderpaidTolerancePercent: underpaidTol,
		JWTSecret:                 getEnv("JWT_SECRET", "13c-super-secure-jwt-secret-key-256bit!"),
		LicenseKey:       getEnv("LICENSE_KEY", "eyJsaWNlbnNlX2lkIjoiMTNDLUxJQy1hNzBlNjg3MS00ZDBkLTQ2MmMtOWNlMy1mOTEzOGU3ZTM3MGMiLCJsaWNlbnNlZSI6IkNhcHRhaW4gQ2xpZW50IiwiZG9tYWluIjoiKiIsInRpZXIiOiJFTlRFUlBSSVNFIiwiaXNzdWVkX2F0IjoiMjAyNi0xMS0xM1QxMDo0NzoxOS45NzZaIiwiZXhwaXJlc19hdCI6IjIwMjctMTEtMTNUMTA6NDc6MTkuOTc3WiIsImhlYXJ0YmVhdF91cmwiOiJodHRwczovLzEzYy1saWNlbnNlLXNlcnZlci52ZXJjZWwuYXBwL2FwaS92ZXJpZnkifQ.l-5h5r5BGSPjngqNNCesB0VmeyXpw-LR9esH7lOwBQwiS3rEAP3QLRN_h6tSM0NFjgbaJUnsy0GhQTgYaYM4Cg"),
		LicenseServerURL: getEnv("LICENSE_SERVER_URL", "https://13c-license-server.vercel.app/api/verify"),

		BSCRPCURL:      getEnv("BSC_RPC_URL", "https://bsc-dataseed.binance.org/"),
		PolygonRPCURL:  getEnv("POLYGON_RPC_URL", "https://polygon-rpc.com/"),
		TronGridAPIURL: getEnv("TRON_GRID_URL", "https://api.trongrid.io"),
		TronAPIKey:     getEnv("TRON_API_KEY", ""),
		SolanaRPCURL:   getEnv("SOLANA_RPC_URL", "https://api.mainnet-beta.solana.com"),

		TestnetBSCRPC:      getEnv("TESTNET_BSC_RPC_URL", "https://data-seed-prebsc-1-s1.binance.org:8545/"),
		TestnetPolygonRPC:  getEnv("TESTNET_POLYGON_RPC_URL", "https://rpc-amoy.polygon.technology/"),
		TestnetTronGridURL: getEnv("TESTNET_TRON_GRID_URL", "https://nile.trongrid.io"),
		TestnetSolanaRPC:   getEnv("TESTNET_SOLANA_RPC_URL", "https://api.devnet.solana.com"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

