package watcher

import (
	"context"

	"captain-gateway/internal/domain"
)

// Standard Token Contract Addresses (Mainnet)
const (
	// EVM USDT/USDC Contracts
	BSC_USDT_CONTRACT     = "0x55d398326f99059fF775485246999027B3197955" // 18 decimals
	POLYGON_USDT_CONTRACT = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" // 6 decimals
	POLYGON_USDC_CONTRACT = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" // 6 decimals

	// TRON TRC-20 USDT Contract
	TRON_USDT_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" // 6 decimals

	// Solana SPL Token Mints
	SOLANA_USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" // 6 decimals
	SOLANA_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // 6 decimals

	// ERC-20 / BEP-20 Transfer Event Keccak-256 Topic:
	// Transfer(address indexed from, address indexed to, uint256 value)
	EVM_TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
)

// NetworkWatcher defines interface for any blockchain indexer daemon
type NetworkWatcher interface {
	Network() domain.Network
	ScanBlocks(ctx context.Context) error
}

