package crypto

import (
	"strings"
	"testing"

	"captain-gateway/internal/domain"
)

func TestAESGCMEncryption(t *testing.T) {
	secret := "super-secure-master-encryption-key-12345"
	original := "my-secret-private-key-hex-string"

	encrypted, err := EncryptAESGCM(original, secret)
	if err != nil {
		t.Fatalf("failed to encrypt: %v", err)
	}

	if encrypted == original {
		t.Fatal("encrypted text matches original")
	}

	decrypted, err := DecryptAESGCM(encrypted, secret)
	if err != nil {
		t.Fatalf("failed to decrypt: %v", err)
	}

	if decrypted != original {
		t.Fatalf("expected %s, got %s", original, decrypted)
	}
}

func TestEVMKeyGen(t *testing.T) {
	evm, err := GenerateEVMKeyPair()
	if err != nil {
		t.Fatalf("failed to generate evm key: %v", err)
	}

	if !strings.HasPrefix(evm.Address, "0x") {
		t.Fatalf("invalid EVM address prefix: %s", evm.Address)
	}
	if len(evm.Address) != 42 {
		t.Fatalf("invalid EVM address length: %d", len(evm.Address))
	}
}

func TestTronKeyGen(t *testing.T) {
	tron, err := GenerateTronKeyPair()
	if err != nil {
		t.Fatalf("failed to generate tron key: %v", err)
	}

	if !strings.HasPrefix(tron.Address, "T") {
		t.Fatalf("invalid Tron address prefix: %s", tron.Address)
	}
	if len(tron.Address) != 34 {
		t.Fatalf("invalid Tron address length: %d", len(tron.Address))
	}
}

func TestSolanaKeyGen(t *testing.T) {
	sol, err := GenerateSolanaKeyPair()
	if err != nil {
		t.Fatalf("failed to generate solana key: %v", err)
	}

	if len(sol.Address) < 32 || len(sol.Address) > 44 {
		t.Fatalf("unexpected Solana address length: %d", len(sol.Address))
	}
}

func TestUnifiedGenerator(t *testing.T) {
	secret := "test-secret"
	networks := []domain.Network{domain.NetworkBSC, domain.NetworkPolygon, domain.NetworkTron, domain.NetworkSolana}

	for _, net := range networks {
		wallet, err := GenerateDepositWallet(net, secret)
		if err != nil {
			t.Fatalf("failed to generate for %s: %v", net, err)
		}
		if wallet.Address == "" || wallet.EncryptedPrivKey == "" {
			t.Fatalf("empty wallet for %s", net)
		}
	}
}

