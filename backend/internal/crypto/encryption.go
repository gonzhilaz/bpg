package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
)

// EncryptAESGCM encrypts plaintext using AES-256-GCM with the provided passphrase
func EncryptAESGCM(plaintext string, secretKey string) (string, error) {
	if plaintext == "" {
		return "", errors.New("plaintext cannot be empty")
	}
	if secretKey == "" {
		return "", errors.New("secret key cannot be empty")
	}

	// Derive 32-byte key from secret passphrase using SHA-256
	key := sha256.Sum256([]byte(secretKey))

	block, err := aes.NewCipher(key[:])
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create gcm: %w", err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("failed to generate nonce: %w", err)
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return hex.EncodeToString(ciphertext), nil
}

// DecryptAESGCM decrypts hex-encoded ciphertext using AES-256-GCM
func DecryptAESGCM(cipherHex string, secretKey string) (string, error) {
	if cipherHex == "" {
		return "", errors.New("ciphertext cannot be empty")
	}
	if secretKey == "" {
		return "", errors.New("secret key cannot be empty")
	}

	data, err := hex.DecodeString(cipherHex)
	if err != nil {
		return "", fmt.Errorf("failed to decode hex ciphertext: %w", err)
	}

	key := sha256.Sum256([]byte(secretKey))

	block, err := aes.NewCipher(key[:])
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create gcm: %w", err)
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return "", errors.New("ciphertext too short")
	}

	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", fmt.Errorf("failed to decrypt: %w", err)
	}

	return string(plaintext), nil
}

// HashSHA256 computes a hex-encoded SHA-256 digest of any string
func HashSHA256(input string) string {
	digest := sha256.Sum256([]byte(input))
	return hex.EncodeToString(digest[:])
}

// GenerateSecureAPIKey generates a CSPRNG-grade API key, its SHA-256 hash, and a safe prefix
func GenerateSecureAPIKey(env string) (rawKey string, hash string, prefixDisplay string, err error) {
	bytes := make([]byte, 24)
	if _, err := rand.Read(bytes); err != nil {
		return "", "", "", fmt.Errorf("failed to generate random bytes: %w", err)
	}
	prefix := "cap_live"
	if env == "test" || env == "sandbox" {
		prefix = "cap_test"
	}
	rawKey = fmt.Sprintf("%s_%s", prefix, hex.EncodeToString(bytes))
	hash = HashSHA256(rawKey)
	prefixDisplay = rawKey[:12] + "..."
	return rawKey, hash, prefixDisplay, nil
}

// GenerateSecureSecretKey generates a 32-byte hex HMAC secret
func GenerateSecureSecretKey() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate random secret: %w", err)
	}
	return "sec_" + hex.EncodeToString(bytes), nil
}


