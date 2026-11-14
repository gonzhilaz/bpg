package watcher

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/glebarez/sqlite"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"13c-gateway/internal/domain"
	"13c-gateway/internal/repository"
)

func TestEVMWatcher_ConfirmationLagAndTopicFilter(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open in-memory db: %v", err)
	}

	if err := db.AutoMigrate(&domain.Merchant{}, &domain.Invoice{}); err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}

	merchantID := uuid.New()
	targetDepositAddr := "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019"

	inv := &domain.Invoice{
		ID:             uuid.New(),
		MerchantID:     merchantID,
		OrderID:        "ORD-CONF-001",
		PayNetwork:     domain.NetworkBSC,
		DepositAddress: targetDepositAddr,
		Status:         domain.StatusPending,
		ExpiresAt:      time.Now().Add(30 * time.Minute),
	}
	db.Create(inv)

	invRepo := repository.NewInvoiceRepository(db)

	var receivedFilter map[string]any
	var ethBlockNumberCalled bool

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req jsonRPCRequest
		_ = json.NewDecoder(r.Body).Decode(&req)

		if req.Method == "eth_blockNumber" {
			ethBlockNumberCalled = true
			// Block 100
			resp := jsonRPCResponse{Result: json.RawMessage(`"0x64"`)}
			_ = json.NewEncoder(w).Encode(resp)
			return
		}

		if req.Method == "eth_getLogs" {
			if len(req.Params) > 0 {
				if f, ok := req.Params[0].(map[string]any); ok {
					receivedFilter = f
				}
			}
			resp := jsonRPCResponse{Result: json.RawMessage(`[]`)}
			_ = json.NewEncoder(w).Encode(resp)
			return
		}
	}))
	defer server.Close()

	watcher := NewEVMWatcher(
		domain.NetworkBSC,
		server.URL,
		"0x55d398326f99059ff775485246999027b3197955",
		18,
		invRepo,
		nil,
	)
	watcher.SetRequiredConfirmations(5) // 5 blocks confirmation lag

	ctx := context.Background()
	if err := watcher.ScanBlocks(ctx); err != nil {
		t.Fatalf("ScanBlocks failed: %v", err)
	}

	if !ethBlockNumberCalled {
		t.Fatalf("expected eth_blockNumber to be called")
	}

	// Block 100 - 5 confirmations = 95 safe head
	// Last scanned should advance
	if watcher.lastScannedBlock == 0 {
		t.Fatalf("expected lastScannedBlock to advance")
	}

	// Verify topic filter was populated with 32-byte padded address
	if receivedFilter == nil {
		t.Fatalf("expected eth_getLogs to be called with filter")
	}

	topics, ok := receivedFilter["topics"].([]any)
	if !ok || len(topics) < 3 {
		t.Fatalf("expected 3 topics, got: %v", topics)
	}

	addrTopics, ok := topics[2].([]any)
	if !ok || len(addrTopics) == 0 {
		t.Fatalf("expected address topic in topics[2]")
	}

	expectedClean := strings.ToLower(strings.TrimPrefix(targetDepositAddr, "0x"))
	foundPadded := addrTopics[0].(string)
	if !strings.HasSuffix(foundPadded, expectedClean) {
		t.Fatalf("expected padded topic to end with %s, got: %s", expectedClean, foundPadded)
	}
}

func TestEVMWatcher_LowBlockWaitConfirmations(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open in-memory db: %v", err)
	}
	db.AutoMigrate(&domain.Invoice{})

	invRepo := repository.NewInvoiceRepository(db)

	getLogsCalled := false
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var req jsonRPCRequest
		_ = json.NewDecoder(r.Body).Decode(&req)

		if req.Method == "eth_blockNumber" {
			// Current block is 2
			resp := jsonRPCResponse{Result: json.RawMessage(`"0x2"`)}
			_ = json.NewEncoder(w).Encode(resp)
			return
		}
		if req.Method == "eth_getLogs" {
			getLogsCalled = true
		}
	}))
	defer server.Close()

	watcher := NewEVMWatcher(domain.NetworkBSC, server.URL, "0xcontract", 18, invRepo, nil)
	watcher.SetRequiredConfirmations(5) // Needs 5 blocks, but head is only 2

	ctx := context.Background()
	_ = watcher.ScanBlocks(ctx)

	// Since currentBlock (2) <= requiredConfs (5), getLogs MUST NOT be called
	if getLogsCalled {
		t.Fatalf("expected getLogs NOT to be called when currentBlock <= requiredConfs")
	}
}
