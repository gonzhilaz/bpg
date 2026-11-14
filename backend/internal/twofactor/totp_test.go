package twofactor_test

import (
	"strings"
	"testing"
	"time"

	"13c-gateway/internal/twofactor"
)

func TestTOTP_GenerateSecretAndValidate(t *testing.T) {
	secret, err := twofactor.GenerateSecret()
	if err != nil {
		t.Fatalf("failed to generate secret: %v", err)
	}

	if len(secret) < 16 {
		t.Fatalf("secret too short: %s", secret)
	}

	// Calculate code for now
	code, err := twofactor.GenerateCode(secret, time.Now())
	if err != nil {
		t.Fatalf("failed to generate code: %v", err)
	}

	if len(code) != 6 {
		t.Fatalf("expected 6-digit code, got %s", code)
	}

	// Validate code
	if !twofactor.ValidateCode(secret, code) {
		t.Fatalf("expected code %s to be valid", code)
	}

	// Validate incorrect code fails
	if twofactor.ValidateCode(secret, "000000") && code != "000000" {
		t.Fatal("expected wrong code to fail")
	}

	// Validate malformed code fails
	if twofactor.ValidateCode(secret, "abc123") {
		t.Fatal("expected non-numeric code to fail")
	}
	if twofactor.ValidateCode(secret, "123") {
		t.Fatal("expected short code to fail")
	}
}

func TestTOTP_GenerateOTPURL(t *testing.T) {
	otpURL := twofactor.GenerateOTPURL("13C Payment Gateway", "merchant@example.com", "JBSWY3DPEHPK3PXP")
	if !strings.HasPrefix(otpURL, "otpauth://totp/") {
		t.Fatalf("unexpected URL prefix: %s", otpURL)
	}
	if !strings.Contains(otpURL, "secret=JBSWY3DPEHPK3PXP") {
		t.Fatalf("missing secret in URL: %s", otpURL)
	}
	if !strings.Contains(otpURL, "issuer=13C+Payment+Gateway") {
		t.Fatalf("missing issuer in URL: %s", otpURL)
	}
}

