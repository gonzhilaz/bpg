"use client";

import React from "react";
import Link from "next/link";
import {
  DollarSign,
  Layers,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Receipt,
  Wallet,
  Key,
} from "lucide-react";
import { useEnvironment } from "../../context/EnvironmentContext";
import { InvoicesTable } from "../../components/dashboard/InvoicesTable";
import { Tooltip } from "../../components/ui/Tooltip";

export default function OverviewPage() {
  const { mode, profile, invoices } = useEnvironment();

  const totalVolume = mode === "LIVE" ? "$750.00" : "$35.00";
  const totalSettled = mode === "LIVE" ? "$500.00" : "$20.00";
  const activeOrders = mode === "LIVE" ? "1 Order" : "1 Order";

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page Title & Profile Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{profile.name}</h1>
          <p className="text-xs text-zinc-400">
            {mode === "LIVE"
              ? "Live Production • Real on-chain settlements enabled"
              : "Sandbox Mode • Test credentials & simulated orders active"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>All Invoices</span>
          </Link>
          <Link
            href="/wallets"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Wallets</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
              {mode === "LIVE" ? "Total Volume" : "Test Volume"}
            </span>
            <Tooltip content="Gross cumulative invoice volume received across all supported blockchain networks" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalVolume}</div>
          <div className="text-[11px] text-zinc-500">{invoices.length} orders processed</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Settled
            </span>
            <Tooltip content="Total funds forwarded to merchant cold wallets after deducting platform fees" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{totalSettled}</div>
          <div className="text-[11px] text-zinc-500">Auto-forwarded to cold wallets</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Active Orders
            </span>
            <Tooltip content="Currently open orders awaiting user deposit or block confirmation" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">{activeOrders}</div>
          <div className="text-[11px] text-zinc-500">Awaiting block confirmation</div>
        </div>
      </div>

      {/* Quick Setup Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white">API Credentials & Webhooks</div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage your live and sandbox API keys, signing secret, and webhook endpoints.
            </p>
            <Link
              href="/api-keys"
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium mt-3"
            >
              <span>Manage Keys</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white">Cold Wallet Destinations</div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Configure TRON, BSC, Polygon, and Solana settlement addresses and fee payer settings.
            </p>
            <Link
              href="/wallets"
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium mt-3"
            >
              <span>Configure Wallets</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table (Top 5) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Recent Invoices</h2>
            <span className="text-xs text-zinc-500">({recentInvoices.length} of {invoices.length})</span>
          </div>
          <Link
            href="/invoices"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <InvoicesTable invoices={recentInvoices} />
      </div>
    </div>
  );
}
