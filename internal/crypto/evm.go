package crypto

import (
	"encoding/hex"
	"fmt"
	"strings"

	"github.com/decred/dcrd/dcrec/secp256k1/v4"
	"golang.org/x/crypto/sha3"
)

// EVMKeyPair holds generated EVM address and private key
type EVMKeyPair struct {
	Address    string
	PrivateKey string
}

// GenerateEVMKeyPair creates a fresh secp256k1 keypair and EVM address for BSC/Polygon
func GenerateEVMKeyPair() (*EVMKeyPair, error) {
	privKey, err := secp256k1.GeneratePrivateKey()
	if err != nil {
		return nil, fmt.Errorf("failed to generate secp256k1 private key: %w", err)
	}

	privKeyHex := hex.EncodeToString(privKey.Serialize())

	// Uncompressed public key is 65 bytes (0x04 || X (32 bytes) || Y (32 bytes))
	pubKeyBytes := privKey.PubKey().SerializeUncompressed()

	// Hash the 64 bytes (excluding the 0x04 prefix) using Keccak-256
	hasher := sha3.NewLegacyKeccak256()
	hasher.Write(pubKeyBytes[1:])
	hash := hasher.Sum(nil)

	// Ethereum address is the last 20 bytes of Keccak256 hash
	addressBytes := hash[12:]
	rawHex := hex.EncodeToString(addressBytes)
	checksumAddress := toChecksumAddress(rawHex)

	return &EVMKeyPair{
		Address:    checksumAddress,
		PrivateKey: privKeyHex,
	}, nil
}

// toChecksumAddress implements EIP-55 mixed-case checksum
func toChecksumAddress(address string) string {
	lowerAddress := strings.ToLower(address)
	hasher := sha3.NewLegacyKeccak256()
	hasher.Write([]byte(lowerAddress))
	hash := hex.EncodeToString(hasher.Sum(nil))

	var checksum strings.Builder
	checksum.WriteString("0x")

	for i := 0; i < len(lowerAddress); i++ {
		char := lowerAddress[i]
		if char >= '0' && char <= '9' {
			checksum.WriteByte(char)
		} else {
			// If the corresponding hex digit of the hash is 8 or higher, uppercase
			if hash[i] >= '8' {
				checksum.WriteByte(char - 32)
			} else {
				checksum.WriteByte(char)
			}
		}
	}

	return checksum.String()
}

