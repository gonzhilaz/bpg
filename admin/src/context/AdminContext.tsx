"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { PlatformMetrics, HotWalletBalance, WatcherStatus, AdminMerchant, NetworkGasItem } from "../types/admin";
import {
  mockPlatformMetrics,
  mockHotWallets,
  mockWatchers,
  mockMerchantsList,
  mockNetworkGasList,
} from "../mocks/mockAdmin";

interface AdminContextType {
  metrics: PlatformMetrics;
  setMetrics: React.Dispatch<React.SetStateAction<PlatformMetrics>>;
  hotWallets: HotWalletBalance[];
  watchers: WatcherStatus[];
  merchants: AdminMerchant[];
  setMerchants: React.Dispatch<React.SetStateAction<AdminMerchant[]>>;
  gasRates: NetworkGasItem[];
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  circuitBreaker: boolean;
  setCircuitBreaker: (active: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<PlatformMetrics>(mockPlatformMetrics);
  const [merchants, setMerchants] = useState<AdminMerchant[]>(mockMerchantsList);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [circuitBreaker, setCircuitBreaker] = useState(mockPlatformMetrics.circuit_breaker_active);

  return (
    <AdminContext.Provider
      value={{
        metrics,
        setMetrics,
        hotWallets: mockHotWallets,
        watchers: mockWatchers,
        merchants,
        setMerchants,
        gasRates: mockNetworkGasList,
        isMobileNavOpen,
        setIsMobileNavOpen,
        circuitBreaker,
        setCircuitBreaker,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}

