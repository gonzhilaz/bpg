package tronenergy_test

import (
	"context"
	"testing"

	"13c-gateway/internal/tronenergy"
)

func TestEnergyRentalService_CheckEnergy(t *testing.T) {
	svc := tronenergy.NewEnergyRentalService(true, "simulated", "")
	ctx := context.Background()

	status, err := svc.CheckEnergy(ctx, "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa")
	if err != nil {
		t.Fatalf("unexpected error checking energy: %v", err)
	}

	if status.EnergyRemaining != 5000 {
		t.Fatalf("expected initial energy 5000, got %d", status.EnergyRemaining)
	}

	if !status.NeedsRental {
		t.Fatal("expected NeedsRental=true when energy < 32000")
	}
}

func TestEnergyRentalService_EnsureEnergyAndRent(t *testing.T) {
	svc := tronenergy.NewEnergyRentalService(true, "simulated", "")
	ctx := context.Background()
	address := "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa"

	// First call: energy is 5,000, so EnsureEnergy triggers rental
	rental, err := svc.EnsureEnergy(ctx, address)
	if err != nil {
		t.Fatalf("unexpected error in EnsureEnergy: %v", err)
	}
	if rental == nil {
		t.Fatal("expected non-nil rental result")
	}
	if rental.EnergyAmount != tronenergy.SafeTRC20EnergyThreshold {
		t.Fatalf("expected rented energy %d, got %d", tronenergy.SafeTRC20EnergyThreshold, rental.EnergyAmount)
	}

	// Second call: energy is now 5,000 + 32,000 = 37,000 (> 32,000 threshold), so rental is not needed
	rental2, err := svc.EnsureEnergy(ctx, address)
	if err != nil {
		t.Fatalf("unexpected error in second EnsureEnergy: %v", err)
	}
	if rental2 != nil {
		t.Fatalf("expected nil rental when energy is sufficient, got %+v", rental2)
	}
}

func TestEnergyRentalService_Disabled(t *testing.T) {
	svc := tronenergy.NewEnergyRentalService(false, "simulated", "")
	ctx := context.Background()

	rental, err := svc.EnsureEnergy(ctx, "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if rental != nil {
		t.Fatal("expected nil rental when service is disabled")
	}
}
