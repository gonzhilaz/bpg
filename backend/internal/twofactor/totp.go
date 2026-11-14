package twofactor

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha1"
	"encoding/base32"
	"encoding/binary"
	"fmt"
	"net/url"
	"strconv"
	"strings"
	"time"
)

// GenerateSecret generates a secure random 20-byte Base32 secret for Google Authenticator
func GenerateSecret() (string, error) {
	bytes := make([]byte, 20)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate random secret: %w", err)
	}
	return base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(bytes), nil
}

// GenerateOTPURL formats the otpauth:// URI recognized by Google Authenticator and 1Password
func GenerateOTPURL(issuer, accountName, secret string) string {
	v := url.Values{}
	v.Set("secret", secret)
	v.Set("issuer", issuer)
	v.Set("algorithm", "SHA1")
	v.Set("digits", "6")
	v.Set("period", "30")

	label := url.PathEscape(fmt.Sprintf("%s:%s", issuer, accountName))
	return fmt.Sprintf("otpauth://totp/%s?%s", label, v.Encode())
}

// GenerateCode calculates the current 6-digit TOTP code for a secret at a given timestamp
func GenerateCode(secret string, t time.Time) (string, error) {
	cleanSecret := strings.ToUpper(strings.TrimSpace(secret))
	key, err := base32.StdEncoding.WithPadding(base32.NoPadding).DecodeString(cleanSecret)
	if err != nil {
		// Try with standard padding
		key, err = base32.StdEncoding.DecodeString(cleanSecret)
		if err != nil {
			return "", fmt.Errorf("invalid base32 secret: %w", err)
		}
	}

	counter := uint64(t.Unix() / 30)
	buf := make([]byte, 8)
	binary.BigEndian.PutUint64(buf, counter)

	mac := hmac.New(sha1.New, key)
	mac.Write(buf)
	hash := mac.Sum(nil)

	// Dynamic truncation (RFC 4226 / RFC 6238)
	offset := hash[len(hash)-1] & 0x0f
	code := binary.BigEndian.Uint32(hash[offset:offset+4]) & 0x7fffffff
	code = code % 1000000

	return fmt.Sprintf("%06d", code), nil
}

// ValidateCode verifies a user-provided 6-digit passcode against the secret with ±1 time step tolerance (drift window)
func ValidateCode(secret, passcode string) bool {
	passcode = strings.TrimSpace(passcode)
	if len(passcode) != 6 {
		return false
	}
	if _, err := strconv.Atoi(passcode); err != nil {
		return false
	}

	now := time.Now()
	// Check current step (0), past step (-30s), and future step (+30s)
	steps := []time.Duration{0, -30 * time.Second, 30 * time.Second}
	for _, step := range steps {
		expected, err := GenerateCode(secret, now.Add(step))
		if err == nil && hmac.Equal([]byte(expected), []byte(passcode)) {
			return true
		}
	}

	return false
}
