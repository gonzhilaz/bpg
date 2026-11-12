package crypto

import (
	"fmt"

	"captain-gateway/internal/domain"
)

// GeneratedWallet contains public deposit address and AES-256 encrypted private key
type GeneratedWallet struct {
	Address          string
	EncryptedPrivKey string
}

// GenerateDepositWallet creates address and encrypted private key for specified network
func GenerateDepositWallet(network domain.Network, secretKey string) (*GeneratedWallet, error) {
	var address string
	var rawPrivKey string

	switch network {
	case domain.NetworkBSC, domain.NetworkPolygon:
		evmKey, err := GenerateEVMKeyPair()
		if err != nil {
			return nil, fmt.Errorf("evm keygen error: %w", err)
		}
		address = evmKey.Address
		rawPrivKey = evmKey.PrivateKey

	case domain.NetworkTron:
		tronKey, err := GenerateTronKeyPair()
		if err != nil {
			return nil, fmt.Errorf("tron keygen error: %w", err)
		}
		address = tronKey.Address
		rawPrivKey = tronKey.PrivateKey

	case domain.NetworkSolana:
		solKey, err := GenerateSolanaKeyPair()
		if err != nil {
			return nil, fmt.Errorf("solana keygen error: %w", err)
		}
		address = solKey.Address
		rawPrivKey = solKey.PrivateKey

	default:
		return nil, fmt.Errorf("unsupported network: %s", network)
	}

	encryptedPrivKey, err := EncryptAESGCM(rawPrivKey, secretKey)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt private key: %w", err)
	}

	return &GeneratedWallet{
		Address:          address,
		EncryptedPrivKey: encryptedPrivKey,
	}, nil
}

