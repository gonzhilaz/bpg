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
import { StatTile } from "../../components/ui/StatTile";
import { Tooltip } from "../../components/ui/Tooltip";

export default function OverviewPage() {
  const { mode, profile, invoices } = useEnvironment();

  const totalVolume = mode === "LIVE" ? "$750.00" : "$35.00";
  const totalSettled = mode === "LIVE" ? "$500.00" : "$20.00";
  const activeOrders = mode === "LIVE" ? "1 Order" : "1 Order";

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">{profile.name}</h1>
          <p className="text-xs text-zinc-400">
            {mode === "LIVE"
              ? "Live Production • Real on-chain settlements enabled"
              : "Sandbox Mode • Test credentials & simulated orders active"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>All Invoices</span>
          </Link>
          <Link
            href="/wallets"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Wallets</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatTile
          label={mode === "LIVE" ? "Total Volume" : "Test Volume"}
          value={totalVolume}
          icon={DollarSign}
          tooltip="Gross cumulative invoice volume received across all supported blockchain networks."
        />
        <StatTile
          label="Settled"
          value={totalSettled}
          icon={Layers}
          tooltip="Total funds forwarded to merchant cold wallets after deducting platform fees."
          trend="Settled"
          trendUp={true}
        />
        <StatTile
          label="Active Orders"
          value={activeOrders}
          icon={Zap}
          tooltip="Currently open orders awaiting user deposit or block confirmation."
          trend="Open"
          trendUp={true}
        />
      </div>

      {/* Quick Setup Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Key className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">API Credentials</span>
              <Tooltip content="Manage your live and sandbox API keys, signing secret, and webhook endpoints." />
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-1">13c_live_... • HMAC-SHA256</div>
            <Link
              href="/api-keys"
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium mt-2"
            >
              <span>Manage Keys</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Cold Wallets</span>
              <Tooltip content="Configure TRON, BSC, Polygon, and Solana settlement addresses and fee payer settings." />
            </div>
            <div className="text-[11px] text-zinc-400 font-mono mt-1">4 Networks • Auto-Payout Active</div>
            <Link
              href="/wallets"
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium mt-2"
            >
              <span>Configure Wallets</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Recent Invoices</h2>
            <span className="text-[10px] text-zinc-500 font-mono">({recentInvoices.length} of {invoices.length})</span>
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
