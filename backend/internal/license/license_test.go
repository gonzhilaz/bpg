package license

import (
	"crypto/ed25519"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"testing"
	"time"
)

func TestVerifyToken_Valid(t *testing.T) {
	pubBytes, err := hex.DecodeString(MasterDeveloperPublicKeyHex)
	if err != nil || len(pubBytes) != ed25519.PublicKeySize {
		t.Fatalf("invalid master developer public key: %v", err)
	}

	// Test default token verification
	token := "eyJsaWNlbnNlX2lkIjoiMTNDLUxJQy1hNzBlNjg3MS00ZDBkLTQ2MmMtOWNlMy1mOTEzOGU3ZTM3MGMiLCJsaWNlbnNlZSI6IkNhcHRhaW4gQ2xpZW50IiwiZG9tYWluIjoiKiIsInRpZXIiOiJFTlRFUlBSSVNFIiwiaXNzdWVkX2F0IjoiMjAyNi0xMS0xM1QxMDo0NzoxOS45NzZaIiwiZXhwaXJlc19hdCI6IjIwMjctMTEtMTNUMTA6NDc6MTkuOTc3WiIsImhlYXJ0YmVhdF91cmwiOiJodHRwczovLzEzYy1saWNlbnNlLXNlcnZlci52ZXJjZWwuYXBwL2FwaS92ZXJpZnkifQ.l-5h5r5BGSPjngqNNCesB0VmeyXpw-LR9esH7lOwBQwiS3rEAP3QLRN_h6tSM0NFjgbaJUnsy0GhQTgYaYM4Cg"

	payload, err := VerifyToken(token)
	if err != nil {
		t.Fatalf("expected valid token verification, got error: %v", err)
	}

	if payload.Licensee != "Captain Client" {
		t.Fatalf("expected licensee 'Captain Client', got '%s'", payload.Licensee)
	}

	if payload.Tier != "ENTERPRISE" {
		t.Fatalf("expected tier 'ENTERPRISE', got '%s'", payload.Tier)
	}
}

func TestVerifyToken_TamperedPayload(t *testing.T) {
	// Create a tampered payload
	payload := map[string]interface{}{
		"license_id": "13C-TAMPERED",
		"licensee":   "Pirate User",
		"tier":       "ENTERPRISE",
		"expires_at": time.Now().Add(24 * time.Hour),
	}
	bytes, _ := json.Marshal(payload)
	tamperedB64 := base64.RawURLEncoding.EncodeToString(bytes)

	// Fake signature
	fakeToken := tamperedB64 + ".fake_signature_bytes_1234567890"
	_, err := VerifyToken(fakeToken)
	if err == nil {
		t.Fatal("expected tampered token to fail verification, but it passed")
	}
}

