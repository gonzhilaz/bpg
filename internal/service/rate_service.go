package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/shopspring/decimal"
)

// RateService defines currency and crypto exchange rate conversions
type RateService interface {
	ConvertToCrypto(ctx context.Context, amountFiat decimal.Decimal, fiatCurrency string, cryptoCurrency string) (decimal.Decimal, error)
}

type rateService struct {
	client      *http.Client
	cache       map[string]decimal.Decimal
	cacheExpiry map[string]time.Time
	mu          sync.RWMutex
}

// NewRateService creates a new rate service with caching and fallback
func NewRateService() RateService {
	return &rateService{
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
		cache:       make(map[string]decimal.Decimal),
		cacheExpiry: make(map[string]time.Time),
	}
}

func (s *rateService) ConvertToCrypto(ctx context.Context, amountFiat decimal.Decimal, fiatCurrency string, cryptoCurrency string) (decimal.Decimal, error) {
	fiat := strings.ToUpper(strings.TrimSpace(fiatCurrency))
	crypto := strings.ToUpper(strings.TrimSpace(cryptoCurrency))

	// Stablecoin 1:1 with USD
	if (crypto == "USDT" || crypto == "USDC") && fiat == "USD" {
		return amountFiat.Round(4), nil
	}

	// Example IDR to USDT default rate estimate if no feed (e.g. 1 USD = 16,000 IDR)
	if (crypto == "USDT" || crypto == "USDC") && fiat == "IDR" {
		rate := s.getRateWithFallback("USDTIDR", decimal.NewFromInt(16200))
		cryptoAmount := amountFiat.Div(rate).Round(4)
		return cryptoAmount, nil
	}

	// Real-time Binance ticker for volatile assets (BNB, SOL)
	pair := fmt.Sprintf("%sUSDT", crypto)
	rate, err := s.fetchBinancePrice(ctx, pair)
	if err != nil {
		// Fallback to cache or default reasonable baseline
		rate = s.getRateWithFallback(pair, decimal.NewFromInt(1))
	}

	if rate.IsZero() {
		return decimal.Zero, fmt.Errorf("invalid zero exchange rate for %s", pair)
	}

	return amountFiat.Div(rate).Round(6), nil
}

func (s *rateService) getRateWithFallback(pair string, fallback decimal.Decimal) decimal.Decimal {
	s.mu.RLock()
	val, ok := s.cache[pair]
	expiry := s.cacheExpiry[pair]
	s.mu.RUnlock()

	if ok && time.Now().Before(expiry) {
		return val
	}
	return fallback
}

func (s *rateService) fetchBinancePrice(ctx context.Context, symbol string) (decimal.Decimal, error) {
	url := fmt.Sprintf("https://api.binance.com/api/v3/ticker/price?symbol=%s", symbol)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return decimal.Zero, err
	}

	resp, err := s.client.Do(req)
	if err != nil {
		return decimal.Zero, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return decimal.Zero, fmt.Errorf("binance api returned status: %d", resp.StatusCode)
	}

	var data struct {
		Price string `json:"price"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return decimal.Zero, err
	}

	rate, err := decimal.NewFromString(data.Price)
	if err != nil {
		return decimal.Zero, err
	}

	s.mu.Lock()
	s.cache[symbol] = rate
	s.cacheExpiry[symbol] = time.Now().Add(5 * time.Minute)
	s.mu.Unlock()

	return rate, nil
}

