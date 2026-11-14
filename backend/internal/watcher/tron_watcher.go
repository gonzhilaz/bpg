package watcher

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/shopspring/decimal"

	"13c-gateway/internal/crypto"
	"13c-gateway/internal/domain"
	"13c-gateway/internal/repository"
	"13c-gateway/internal/service"
)

// TronWatcher polls TronGrid for TRC-20 USDT Transfer events
type TronWatcher struct {
	gridURL         string
	apiKey          string
	contractAddress string
	invRepo         repository.InvoiceRepository
	invoiceSvc      service.InvoiceService
	httpClient      *http.Client
	lastSeenTs      int64
	gracePeriod     time.Duration
}

// NewTronWatcher creates a new TRON network indexer
func NewTronWatcher(
	gridURL string,
	apiKey string,
	contractAddress string,
	invRepo repository.InvoiceRepository,
	invoiceSvc service.InvoiceService,
	gracePeriod ...time.Duration,
) *TronWatcher {
	grace := 15 * time.Minute
	if len(gracePeriod) > 0 && gracePeriod[0] >= 0 {
		grace = gracePeriod[0]
	}
	if contractAddress == "" {
		contractAddress = TRON_USDT_CONTRACT
	}

	return &TronWatcher{
		gridURL:         gridURL,
		apiKey:          apiKey,
		contractAddress: contractAddress,
		invRepo:         invRepo,
		invoiceSvc:      invoiceSvc,
		gracePeriod:     grace,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		lastSeenTs: time.Now().Add(-5 * time.Minute).UnixMilli(),
	}
}

func (w *TronWatcher) Network() domain.Network {
	return domain.NetworkTron
}

type tronEventItem struct {
	BlockNumber     uint64 `json:"block_number"`
	BlockTimestamp  int64  `json:"block_timestamp"`
	TransactionID   string `json:"transaction_id"`
	Result          struct {
		From  string `json:"from"`
		To    string `json:"to"`
		Value string `json:"value"`
	} `json:"result"`
}

type tronEventResponse struct {
	Data    []tronEventItem `json:"data"`
	Success bool            `json:"success"`
}

// ScanBlocks fetches recent confirmed TRC-20 Transfer events from TronGrid
func (w *TronWatcher) ScanBlocks(ctx context.Context) error {
	activeInvoices, err := w.invRepo.GetActiveInvoicesWithGrace(ctx, domain.NetworkTron, w.gracePeriod)
	if err != nil {
		return fmt.Errorf("[TRON] failed to get active invoices: %w", err)
	}

	if len(activeInvoices) == 0 {
		return nil
	}

	addressMap := make(map[string]bool)
	for _, inv := range activeInvoices {
		addressMap[inv.DepositAddress] = true
	}

	url := fmt.Sprintf("%s/v1/contracts/%s/events?event_name=Transfer&only_confirmed=true&min_timestamp=%d&limit=50",
		w.gridURL, w.contractAddress, w.lastSeenTs)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	if w.apiKey != "" {
		req.Header.Set("TRON-PRO-API-KEY", w.apiKey)
	}

	resp, err := w.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("[TRON] TronGrid request error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("[TRON] TronGrid returned status: %d", resp.StatusCode)
	}

	var eventResp tronEventResponse
	if err := json.NewDecoder(resp.Body).Decode(&eventResp); err != nil {
		return err
	}

	maxTs := w.lastSeenTs
	for _, event := range eventResp.Data {
		if event.BlockTimestamp > maxTs {
			maxTs = event.BlockTimestamp
		}

		toNormalized := crypto.NormalizeTronAddress(event.Result.To)
		if addressMap[toNormalized] || addressMap[event.Result.To] {
			rawVal, err := decimal.NewFromString(event.Result.Value)
			if err != nil {
				continue
			}

			// USDT TRC-20 has 6 decimals
			amountDec := rawVal.Div(decimal.NewFromInt(1_000_000))

			log.Printf("[TRON] MATCHED DEPOSIT! Tx: %s, To: %s, Amount: %s",
				event.TransactionID, toNormalized, amountDec.String())

			_, err = w.invoiceSvc.RecordPayment(ctx, toNormalized, amountDec, event.TransactionID, domain.NetworkTron, event.BlockNumber)
			if err != nil {
				log.Printf("[TRON] Error recording payment: %v", err)
			}
		}
	}

	if len(eventResp.Data) > 0 {
		w.lastSeenTs = maxTs + 1
	}
	return nil
}

