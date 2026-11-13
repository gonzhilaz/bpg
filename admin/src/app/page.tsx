"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  Flame,
  Activity,
  Database,
  TrendingUp,
  Users,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { PlatformMetricsCard } from "../components/admin/PlatformMetricsCard";
import { Tooltip } from "../components/ui/Tooltip";
import { IconButton } from "../components/ui/IconButton";

export default function AdminOverviewPage() {
  const { metrics, hotWallets, watchers, merchants } = useAdmin();

  const lowGasCount = hotWallets.filter((w) => w.status === "LOW").length;
  const activeWatchersCount = watchers.filter((w) => w.status === "ACTIVE").length;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">System Operations</h1>
          <p className="text-xs text-zinc-400">
            Real-time infrastructure health, platform liquidity reserves, and merchant governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/merchants"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Merchants ({merchants.length})</span>
          </Link>
          <Link
            href="/gas-liquidity"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Gas Reserves</span>
          </Link>
        </div>
      </div>

      {/* 1. Platform Key Performance Metrics & Emergency Switch */}
      <PlatformMetricsCard metrics={metrics} />

      {/* 2. Platform Subsystem Health Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Gas Reserves Glance */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Gas Liquidity</h3>
              <Tooltip content="Operational native gas balances reserved for automatic on-chain sweep transactions." />
            </div>
            <Link
              href="/gas-liquidity"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {hotWallets.map((w) => (
              <div
                key={w.network}
                className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      w.status === "HEALTHY" ? "bg-emerald-400" : "bg-amber-400 animate-ping"
                    }`}
                  />
                  <span className="font-sans font-medium text-zinc-300">{w.network}</span>
                </div>
                <span className={w.status === "HEALTHY" ? "text-zinc-200" : "text-amber-400 font-bold"}>
                  {w.balance.split(" ")[0]} {w.symbol}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            {lowGasCount > 0 ? (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{lowGasCount} Network Low Gas</span>
                <Tooltip content="Polygon hot wallet gas is below safety threshold. Top-up required." />
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All Reserves Healthy</span>
              </div>
            )}
          </div>
        </div>

        {/* Watcher Node Sync Glance */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Multi-Chain Watchers</h3>
              <Tooltip content="Background blockchain indexer daemons scanning blocks for deposit transactions." />
            </div>
            <Link
              href="/watchers"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
            >
              <span>Inspect</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {watchers.map((w) => (
              <div
                key={w.network}
                className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="font-sans font-medium text-zinc-300">{w.network}</span>
                </div>
                <span className="text-cyan-400">{w.latency_ms}ms</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{activeWatchersCount}/4 Watchers Synced</span>
              <Tooltip content="All RPC endpoints responding within sub-250ms latency." />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Deep Ops Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/database"
          className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all space-y-1.5 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">Database Engine</span>
              <Tooltip content="Connection pools, row count audits, and zero-lock data pruning." />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <div className="text-[11px] text-zinc-400 font-mono">Pool 100 • 6 Tables Audited</div>
        </Link>

        <Link
          href="/finance"
          className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all space-y-1.5 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Financial Revenue</span>
              <Tooltip content="Cumulative platform commission ledger and sweep gas expenses." />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <div className="text-[11px] text-zinc-400 font-mono">0.4% Platform Margin • Ledger</div>
        </Link>

        <Link
          href="/settings"
          className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all space-y-1.5 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Platform Parameters</span>
              <Tooltip content="Platform fee rates, RPC endpoints, and emergency circuit breakers." />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <div className="text-[11px] text-zinc-400 font-mono">Economics & Emergency Switches</div>
        </Link>
      </div>
    </div>
  );
}
