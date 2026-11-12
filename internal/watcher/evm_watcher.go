package watcher

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/shopspring/decimal"

	"captain-gateway/internal/domain"
	"captain-gateway/internal/repository"
	"captain-gateway/internal/service"
)

// EVMWatcher monitors BSC and Polygon networks for ERC-20/BEP-20 transfers
type EVMWatcher struct {
	network          domain.Network
	rpcURL           string
	contractAddress  string
	decimals         int32
	invRepo          repository.InvoiceRepository
	invoiceSvc       service.InvoiceService
	httpClient       *http.Client
	lastScannedBlock uint64
}

// NewEVMWatcher creates a new EVM indexer for BSC or Polygon
func NewEVMWatcher(
	network domain.Network,
	rpcURL string,
	contractAddress string,
	decimals int32,
	invRepo repository.InvoiceRepository,
	invoiceSvc service.InvoiceService,
) *EVMWatcher {
	return &EVMWatcher{
		network:         network,
		rpcURL:          rpcURL,
		contractAddress: strings.ToLower(contractAddress),
		decimals:        decimals,
		invRepo:         invRepo,
		invoiceSvc:      invoiceSvc,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (w *EVMWatcher) Network() domain.Network {
	return w.network
}

type jsonRPCRequest struct {
	JSONRPC string `json:"jsonrpc"`
	Method  string `json:"method"`
	Params  []any  `json:"params"`
	ID      int    `json:"id"`
}

type jsonRPCResponse struct {
	Result json.RawMessage `json:"result"`
	Error  *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

type logEntry struct {
	Address     string   `json:"address"`
	Topics      []string `json:"topics"`
	Data        string   `json:"data"`
	BlockNumber string   `json:"blockNumber"`
	TxHash      string   `json:"transactionHash"`
}

// ScanBlocks fetches recent logs and processes deposits for active invoices
func (w *EVMWatcher) ScanBlocks(ctx context.Context) error {
	activeInvoices, err := w.invRepo.GetActivePendingInvoices(ctx, w.network)
	if err != nil {
		return fmt.Errorf("[%s] failed to get active invoices: %w", w.network, err)
	}

	if len(activeInvoices) == 0 {
		return nil
	}

	// Build map of watched deposit addresses in lowercase
	addressMap := make(map[string]bool)
	for _, inv := range activeInvoices {
		cleanAddr := strings.ToLower(strings.TrimPrefix(inv.DepositAddress, "0x"))
		addressMap[cleanAddr] = true
	}

	// 1. Get current block number
	currentBlock, err := w.getLatestBlockNumber(ctx)
	if err != nil {
		return fmt.Errorf("[%s] getBlockNumber error: %w", w.network, err)
	}

	if w.lastScannedBlock == 0 {
		// Start scanning from 10 blocks ago
		if currentBlock > 10 {
			w.lastScannedBlock = currentBlock - 10
		} else {
			w.lastScannedBlock = currentBlock
		}
	}

	if currentBlock <= w.lastScannedBlock {
		return nil
	}

	fromBlock := w.lastScannedBlock + 1
	toBlock := currentBlock
	// Limit block batch size to 20 to avoid RPC provider limits
	if toBlock-fromBlock > 20 {
		toBlock = fromBlock + 20
	}

	// 2. Query eth_getLogs for the USDT contract
	logs, err := w.getLogs(ctx, fromBlock, toBlock)
	if err != nil {
		return fmt.Errorf("[%s] getLogs error: %w", w.network, err)
	}

	// 3. Inspect logs for transfers to active deposit addresses
	for _, l := range logs {
		if len(l.Topics) < 3 {
			continue
		}

		// Topic[2] contains the 32-byte padded "to" address
		rawTo := strings.ToLower(strings.TrimPrefix(l.Topics[2], "0x"))
		if len(rawTo) == 64 {
			rawTo = rawTo[24:] // Extract 20-byte address hex (40 chars)
		}

		if addressMap[rawTo] {
			// Found matching transfer!
			amountBig := new(big.Int)
			hexData := strings.TrimPrefix(l.Data, "0x")
			amountBig.SetString(hexData, 16)

			amountDec := decimal.NewFromBigInt(amountBig, -w.decimals)
			depositAddr := "0x" + rawTo

			blockNum, _ := strconv.ParseUint(strings.TrimPrefix(l.BlockNumber, "0x"), 16, 64)

			log.Printf("[%s] MATCHED DEPOSIT! Tx: %s, To: %s, Amount: %s",
				w.network, l.TxHash, depositAddr, amountDec.String())

			_, err := w.invoiceSvc.RecordPayment(ctx, depositAddr, amountDec, l.TxHash, w.network, blockNum)
			if err != nil {
				log.Printf("[%s] Error recording payment: %v", w.network, err)
			}
		}
	}

	w.lastScannedBlock = toBlock
	return nil
}

func (w *EVMWatcher) getLatestBlockNumber(ctx context.Context) (uint64, error) {
	reqBody, _ := json.Marshal(jsonRPCRequest{
		JSONRPC: "2.0",
		Method:  "eth_blockNumber",
		Params:  []any{},
		ID:      1,
	})

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, w.rpcURL, bytes.NewReader(reqBody))
	if err != nil {
		return 0, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := w.httpClient.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	var rpcResp jsonRPCResponse
	if err := json.NewDecoder(resp.Body).Decode(&rpcResp); err != nil {
		return 0, err
	}

	var hexBlock string
	if err := json.Unmarshal(rpcResp.Result, &hexBlock); err != nil {
		return 0, err
	}

	return strconv.ParseUint(strings.TrimPrefix(hexBlock, "0x"), 16, 64)
}

func (w *EVMWatcher) getLogs(ctx context.Context, fromBlock, toBlock uint64) ([]logEntry, error) {
	filter := map[string]any{
		"fromBlock": fmt.Sprintf("0x%x", fromBlock),
		"toBlock":   fmt.Sprintf("0x%x", toBlock),
		"address":   w.contractAddress,
		"topics":    []any{EVM_TRANSFER_TOPIC},
	}

	reqBody, _ := json.Marshal(jsonRPCRequest{
		JSONRPC: "2.0",
		Method:  "eth_getLogs",
		Params:  []any{filter},
		ID:      2,
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

	if rpcResp.Error != nil {
		return nil, fmt.Errorf("rpc error: %s", rpcResp.Error.Message)
	}

	var logs []logEntry
	if err := json.Unmarshal(rpcResp.Result, &logs); err != nil {
		return nil, err
	}

	return logs, nil
}
