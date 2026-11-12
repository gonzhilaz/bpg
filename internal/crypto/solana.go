package crypto

import (
	"crypto/ed25519"
	"crypto/rand"
	"fmt"

	"github.com/mr-tron/base58"
)

// SolanaKeyPair holds generated Solana address and private key
type SolanaKeyPair struct {
	Address    string
	PrivateKey string // Base58 encoded 64-byte Ed25519 keypair
}

// GenerateSolanaKeyPair creates a fresh Ed25519 keypair and Base58 Solana address
func GenerateSolanaKeyPair() (*SolanaKeyPair, error) {
	pubKey, privKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return nil, fmt.Errorf("failed to generate Ed25519 keypair: %w", err)
	}

	address := base58.Encode(pubKey)
	privKeyBase58 := base58.Encode(privKey)

	return &SolanaKeyPair{
		Address:    address,
		PrivateKey: privKeyBase58,
	}, nil
}

