"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { EnvironmentMode, MerchantProfile, DashboardInvoice, PayoutRecord, WebhookLog } from "../types/merchant";
import { MerchantService, UpdateProfilePayload } from "../services/merchantService";

interface EnvironmentContextType {
  mode: EnvironmentMode;
  setMode: (mode: EnvironmentMode) => void;
  profile: MerchantProfile;
  invoices: DashboardInvoice[];
  payouts: PayoutRecord[];
  webhookLogs: WebhookLog[];
  isLoading: boolean;
  isDbConnected: boolean;
  error: string | null;
  reload: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<{ success: boolean; error?: string }>;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
}

const defaultProfile: MerchantProfile = {
  id: "",
  name: "Loading Merchant...",
  api_key: "",
  secret_key: "",
  payout_address_bsc: "",
  payout_address_polygon: "",
  payout_address_tron: "",
  payout_address_solana: "",
  auto_payout_enabled: true,
  fee_payer: "customer",
  underpaid_tolerance: 0.0,
  webhook_url: "",
};

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<EnvironmentMode>("LIVE");
  const [profile, setProfile] = useState<MerchantProfile>(defaultProfile);
  const [invoices, setInvoices] = useState<DashboardInvoice[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  const fetchRealData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [profileRes, invoicesRes] = await Promise.all([
        MerchantService.getProfile(),
        MerchantService.getInvoices({ page: 1, limit: 50 }),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setIsDbConnected(true);
      } else {
        setIsDbConnected(false);
        setError(profileRes.error || "Failed to connect to database");
      }

      if (invoicesRes.data?.invoices) {
        setInvoices(invoicesRes.data.invoices);
      }
    } catch (err: unknown) {
      setIsDbConnected(false);
      setError(err instanceof Error ? err.message : "Database connection refused");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealData();
  }, [fetchRealData]);

  const updateProfile = async (payload: UpdateProfilePayload): Promise<{ success: boolean; error?: string }> => {
    const res = await MerchantService.updateProfile(payload);
    if (res.data) {
      setProfile(res.data);
      return { success: true };
    }
    return { success: false, error: res.error || "Failed to update profile in database" };
  };

  return (
    <EnvironmentContext.Provider
      value={{
        mode,
        setMode,
        profile,
        invoices,
        payouts,
        webhookLogs,
        isLoading,
        isDbConnected,
        error,
        reload: fetchRealData,
        updateProfile,
        isMobileNavOpen,
        setIsMobileNavOpen,
      }}
    >
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (!context) {
    throw new Error("useEnvironment must be used within an EnvironmentProvider");
  }
  return context;
}
