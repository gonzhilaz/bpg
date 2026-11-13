"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { EnvironmentMode, MerchantProfile, DashboardInvoice, PayoutRecord, WebhookLog } from "../types/merchant";
import {
  mockLiveProfile,
  mockSandboxProfile,
  mockLiveInvoices,
  mockSandboxInvoices,
  mockLivePayouts,
  mockSandboxPayouts,
  mockSandboxWebhookLogs,
} from "../mocks/mockMerchant";

interface EnvironmentContextType {
  mode: EnvironmentMode;
  setMode: (mode: EnvironmentMode) => void;
  profile: MerchantProfile;
  invoices: DashboardInvoice[];
  payouts: PayoutRecord[];
  webhookLogs: WebhookLog[];
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<EnvironmentMode>("SANDBOX");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  const profile = mode === "LIVE" ? mockLiveProfile : mockSandboxProfile;
  const invoices = mode === "LIVE" ? mockLiveInvoices : mockSandboxInvoices;
  const payouts = mode === "LIVE" ? mockLivePayouts : mockSandboxPayouts;
  const webhookLogs = mockSandboxWebhookLogs;

  return (
    <EnvironmentContext.Provider
      value={{
        mode,
        setMode,
        profile,
        invoices,
        payouts,
        webhookLogs,
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

