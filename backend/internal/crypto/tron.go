package crypto

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"

	"github.com/decred/dcrd/dcrec/secp256k1/v4"
	"github.com/mr-tron/base58"
	"golang.org/x/crypto/sha3"
)

// TronKeyPair holds generated TRON address and private key
type TronKeyPair struct {
	Address    string
	PrivateKey string
}

// GenerateTronKeyPair creates a fresh secp256k1 keypair and Base58Check TRON address
func GenerateTronKeyPair() (*TronKeyPair, error) {
	privKey, err := secp256k1.GeneratePrivateKey()
	if err != nil {
		return nil, fmt.Errorf("failed to generate TRON secp256k1 private key: %w", err)
	}

	privKeyHex := hex.EncodeToString(privKey.Serialize())

	// Uncompressed public key (65 bytes)
	pubKeyBytes := privKey.PubKey().SerializeUncompressed()

	// Keccak-256 of public key without 0x04 prefix (64 bytes)
	hasher := sha3.NewLegacyKeccak256()
	hasher.Write(pubKeyBytes[1:])
	hash := hasher.Sum(nil)

	// Last 20 bytes
	address20 := hash[12:]

	// TRON mainnet prefix is 0x41
	tronAddressBytes := append([]byte{0x41}, address20...)

	// Double SHA-256 for 4-byte checksum
	firstHash := sha256.Sum256(tronAddressBytes)
	secondHash := sha256.Sum256(firstHash[:])
	checksum := secondHash[:4]

	// 21 bytes + 4 bytes checksum = 25 bytes
	fullAddressBytes := append(tronAddressBytes, checksum...)
	base58Address := base58.Encode(fullAddressBytes)

	return &TronKeyPair{
		Address:    base58Address,
		PrivateKey: privKeyHex,
	}, nil
}

// NormalizeTronAddress converts either 42-char hex (e.g. 41...) or Base58 (T...) to canonical Base58Check format
func NormalizeTronAddress(addr string) string {
	addr = strings.TrimSpace(addr)
	if strings.HasPrefix(addr, "0x") || strings.HasPrefix(addr, "0X") {
		addr = addr[2:]
	}

	// 42 hex characters starting with 41
	if len(addr) == 42 && (strings.HasPrefix(addr, "41") || strings.HasPrefix(addr, "41")) {
		rawBytes, err := hex.DecodeString(addr)
		if err == nil && len(rawBytes) == 21 {
			firstHash := sha256.Sum256(rawBytes)
			secondHash := sha256.Sum256(firstHash[:])
			checksum := secondHash[:4]
			full := append(rawBytes, checksum...)
			return base58.Encode(full)
		}
	}

	return addr
}
