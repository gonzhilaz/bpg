package watcher

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/shopspring/decimal"

	"captain-gateway/internal/domain"
	"captain-gateway/internal/repository"
	"captain-gateway/internal/service"
)

// SolanaWatcher monitors Solana SPL token transfers to active deposit addresses
type SolanaWatcher struct {
	rpcURL     string
	invRepo    repository.InvoiceRepository
	invoiceSvc service.InvoiceService
	httpClient *http.Client
	seenSigs   map[string]bool
}

// NewSolanaWatcher creates a new Solana network indexer
func NewSolanaWatcher(
	rpcURL string,
	invRepo repository.InvoiceRepository,
	invoiceSvc service.InvoiceService,
) *SolanaWatcher {
	return &SolanaWatcher{
		rpcURL:     rpcURL,
		invRepo:    invRepo,
		invoiceSvc: invoiceSvc,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
		seenSigs: make(map[string]bool),
	}
}

func (w *SolanaWatcher) Network() domain.Network {
	return domain.NetworkSolana
}

type solSignatureInfo struct {
	Signature string `json:"signature"`
	Slot      uint64 `json:"slot"`
	Err       any    `json:"err"`
}

type solParsedTx struct {
	Meta struct {
		PostTokenBalances []struct {
			Owner    string `json:"owner"`
			Mint     string `json:"mint"`
			UiAmount struct {
				UiAmountString string `json:"uiAmountString"`
			} `json:"uiTokenAmount"`
		} `json:"postTokenBalances"`
		PreTokenBalances []struct {
			Owner    string `json:"owner"`
			Mint     string `json:"mint"`
			UiAmount struct {
				UiAmountString string `json:"uiAmountString"`
			} `json:"uiTokenAmount"`
		} `json:"preTokenBalances"`
	} `json:"meta"`
	Slot uint64 `json:"slot"`
}

// ScanBlocks polls recent signatures for all active Solana deposit addresses
func (w *SolanaWatcher) ScanBlocks(ctx context.Context) error {
	activeInvoices, err := w.invRepo.GetActivePendingInvoices(ctx, domain.NetworkSolana)
	if err != nil {
		return fmt.Errorf("[SOLANA] failed to get active invoices: %w", err)
	}

	for _, inv := range activeInvoices {
		sigs, err := w.getSignaturesForAddress(ctx, inv.DepositAddress)
		if err != nil {
			continue
		}

		for _, sig := range sigs {
			if sig.Err != nil || w.seenSigs[sig.Signature] {
				continue
			}

			// Mark signature as seen
			w.seenSigs[sig.Signature] = true

			// Parse transaction balance delta
			txInfo, err := w.getTransaction(ctx, sig.Signature)
			if err != nil || txInfo == nil {
				continue
			}

			// Calculate net positive token balance delta for this deposit address
			amountReceived := w.calculateTokenDelta(txInfo, inv.DepositAddress)
			if amountReceived.GreaterThan(decimal.Zero) {
				log.Printf("[SOLANA] MATCHED DEPOSIT! Sig: %s, To: %s, Amount: %s",
					sig.Signature, inv.DepositAddress, amountReceived.String())

				_, err = w.invoiceSvc.RecordPayment(ctx, inv.DepositAddress, amountReceived, sig.Signature, domain.NetworkSolana, sig.Slot)
				if err != nil {
					log.Printf("[SOLANA] Error recording payment: %v", err)
				}
			}
		}
	}

	return nil
}

func (w *SolanaWatcher) getSignaturesForAddress(ctx context.Context, address string) ([]solSignatureInfo, error) {
	reqBody, _ := json.Marshal(jsonRPCRequest{
		JSONRPC: "2.0",
		Method:  "getSignaturesForAddress",
		Params: []any{
			address,
			map[string]any{"limit": 5},
		},
		ID: 1,
	})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, w.rpcURL, bytes.NewReader(reqBody))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := w.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var rpcResp jsonRPCResponse
	if err := json.NewDecoder(resp.Body).Decode(&rpcResp); err != nil {
		return nil, err
	}

	var sigs []solSignatureInfo
	_ = json.Unmarshal(rpcResp.Result, &sigs)
	return sigs, nil
}

func (w *SolanaWatcher) getTransaction(ctx context.Context, signature string) (*solParsedTx, error) {
	reqBody, _ := json.Marshal(jsonRPCRequest{
		JSONRPC: "2.0",
		Method:  "getTransaction",
		Params: []any{
			signature,
			map[string]any{
				"encoding":                       "jsonParsed",
				"maxSupportedTransactionVersion": 0,
			},
		},
		ID: 2,
	})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, w.rpcURL, bytes.NewReader(reqBody))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := w.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var rpcResp jsonRPCResponse
	if err := json.NewDecoder(resp.Body).Decode(&rpcResp); err != nil {
		return nil, err
	}

	var tx solParsedTx
	if err := json.Unmarshal(rpcResp.Result, &tx); err != nil {
		return nil, err
	}
	return &tx, nil
}

func (w *SolanaWatcher) calculateTokenDelta(tx *solParsedTx, ownerAddress string) decimal.Decimal {
	var postAmount decimal.Decimal
	var preAmount decimal.Decimal

	for _, b := range tx.Meta.PostTokenBalances {
		if b.Owner == ownerAddress && (b.Mint == SOLANA_USDT_MINT || b.Mint == SOLANA_USDC_MINT) {
			postAmount, _ = decimal.NewFromString(b.UiAmount.UiAmountString)
		}
	}
	for _, b := range tx.Meta.PreTokenBalances {
		if b.Owner == ownerAddress && (b.Mint == SOLANA_USDT_MINT || b.Mint == SOLANA_USDC_MINT) {
			preAmount, _ = decimal.NewFromString(b.UiAmount.UiAmountString)
		}
	}

	if postAmount.GreaterThan(preAmount) {
		return postAmount.Sub(preAmount)
	}
	return decimal.Zero
}

