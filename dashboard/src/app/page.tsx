"use client";

import React, { useState } from "react";
import { Zap, ShieldCheck, ExternalLink, ArrowUpRight, DollarSign, Layers, Terminal } from "lucide-react";
import { EnvironmentMode } from "../types/merchant";
import {
  mockLiveProfile,
  mockSandboxProfile,
  mockLiveInvoices,
  mockSandboxInvoices,
  mockLivePayouts,
  mockSandboxPayouts,
  mockSandboxWebhookLogs,
} from "../mocks/mockMerchant";
import { EnvironmentToggle } from "../components/dashboard/EnvironmentToggle";
import { ApiKeyCard } from "../components/dashboard/ApiKeyCard";
import { PayoutSettingsCard } from "../components/dashboard/PayoutSettingsCard";
import { InvoicesTable } from "../components/dashboard/InvoicesTable";
import { PayoutsTable } from "../components/dashboard/PayoutsTable";
import { WebhookLogsCard } from "../components/dashboard/WebhookLogsCard";
import { FinancialReportCard } from "../components/dashboard/FinancialReportCard";

export default function DashboardPage() {
  const [mode, setMode] = useState<EnvironmentMode>("SANDBOX");

  const profile = mode === "LIVE" ? mockLiveProfile : mockSandboxProfile;
  const invoices = mode === "LIVE" ? mockLiveInvoices : mockSandboxInvoices;
  const payouts = mode === "LIVE" ? mockLivePayouts : mockSandboxPayouts;

  const totalVolume = mode === "LIVE" ? "$750.00" : "$35.00";
  const totalSettled = mode === "LIVE" ? "$500.00" : "$20.00";
  const activeOrders = mode === "LIVE" ? "1 Order" : "1 Order";

  return (
    <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-sans pb-16">
      {/* Top Banner for Sandbox Mode */}
      {mode === "SANDBOX" && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 text-xs text-amber-300 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-semibold">Sandbox & Testnet Active</span>
            <span className="text-amber-400/70 hidden sm:inline">• Test with Mock Simulator or On-Chain Testnets</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-zinc-400 hidden md:inline">Testnet Faucets:</span>
            <a
              href="https://www.nileex.io/join/getJoinPage"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:underline"
            >
              TRON Nile
            </a>
            <span className="text-zinc-600">•</span>
            <a
              href="https://www.bnbchain.org/en/testnet-faucet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:underline"
            >
              BSC Testnet
            </a>
            <span className="text-zinc-600">•</span>
            <a
              href="https://faucet.solana.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:underline"
            >
              Solana Devnet
            </a>
            <span className="text-zinc-600">•</span>
            <a
              href="http://localhost:3000/sandbox"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold underline hover:text-white"
            >
              <span>Simulator</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-zinc-950 font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </span>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">Captain Gateway</div>
              <div className="text-[10px] text-zinc-400 tracking-wider uppercase font-semibold">
                Merchant Portal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <EnvironmentToggle mode={mode} onToggle={setMode} />

            <div className="h-5 w-px bg-zinc-800" />

            <div className="flex items-center gap-2">
              <a
                href="http://localhost:3000/sandbox"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
              >
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span>Simulator</span>
              </a>

              <a
                href="http://localhost:8080/swagger"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/30 transition-colors"
              >
                <span>Swagger</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{profile.name}</h1>
            <p className="text-xs text-zinc-400">
              {mode === "LIVE"
                ? "Live Production • Real on-chain settlements enabled"
                : "Sandbox Mode • Using test credentials and simulated settlements"}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="w-4 h-4" />
            <span>Hot Wallet Connected</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-1">
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
              {mode === "LIVE" ? "Total Volume" : "Test Volume"}
            </div>
            <div className="text-2xl font-bold font-mono text-white">{totalVolume}</div>
            <div className="text-[11px] text-zinc-500">{invoices.length} orders tracked</div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-1">
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Settled
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">{totalSettled}</div>
            <div className="text-[11px] text-zinc-500">Auto-forwarded to cold wallets</div>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-1">
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Active
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400">{activeOrders}</div>
            <div className="text-[11px] text-zinc-500">Awaiting block confirmation</div>
          </div>
        </div>

        {/* Credentials & Payout Config Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ApiKeyCard apiKey={profile.api_key} secretKey={profile.secret_key} />
          <PayoutSettingsCard profile={profile} />
        </div>

        {/* Financial Accounting Ledger */}
        <FinancialReportCard />

        {/* Tables */}
        <div className="space-y-6">
          <InvoicesTable invoices={invoices} />
          <PayoutsTable payouts={payouts} />
          {mode === "SANDBOX" && <WebhookLogsCard logs={mockSandboxWebhookLogs} />}
        </div>
      </main>
    </div>
  );
}
