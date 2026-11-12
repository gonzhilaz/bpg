"use client";

import React, { useState } from "react";
import { DollarSign, Percent, Users, AlertOctagon, CheckCircle2 } from "lucide-react";
import { PlatformMetrics } from "../../types/admin";
import { Tooltip } from "../ui/Tooltip";

interface Props {
  metrics: PlatformMetrics;
}

export function PlatformMetricsCard({ metrics }: Props) {
  const [circuitBreaker, setCircuitBreaker] = useState(metrics.circuit_breaker_active);

  return (
    <div className="space-y-4">
      {/* Circuit Breaker Warning Banner if Paused */}
      {circuitBreaker && (
        <div className="bg-rose-500/15 border border-rose-500/30 p-3 rounded-2xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="font-semibold">EMERGENCY PAUSE ACTIVE</span>
            <span className="hidden sm:inline text-rose-400/80">• Automatic payouts and sweeping temporarily frozen</span>
          </div>
          <button
            type="button"
            onClick={() => setCircuitBreaker(false)}
            className="px-2.5 py-1 rounded-lg bg-rose-500/30 hover:bg-rose-500/40 font-semibold"
          >
            Resume Gateway
          </button>
        </div>
      )}

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Volume */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl shadow-xl space-y-1">
          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
              Total Volume
            </span>
            <Tooltip content="Gross cryptocurrency payment volume processed across all merchants." />
          </div>
          <div className="text-2xl font-bold font-mono text-white">${metrics.total_volume_usd}</div>
          <div className="text-[11px] text-zinc-500">All networks combined</div>
        </div>

        {/* Platform Fee Revenue */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl shadow-xl space-y-1">
          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              Fee Revenue
            </span>
            <Tooltip content="Platform commission cut (0.4%) automatically retained from payouts." />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ${metrics.platform_fee_revenue_usd}
          </div>
          <div className="text-[11px] text-zinc-500">0.4% platform margin</div>
        </div>

        {/* Active Merchants */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl shadow-xl space-y-1">
          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Merchants
            </span>
            <Tooltip content="Verified merchants currently processing transactions." />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {metrics.active_merchants_count}
          </div>
          <div className="text-[11px] text-zinc-500 flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            100% Active Status
          </div>
        </div>

        {/* Circuit Breaker Control Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl shadow-xl space-y-2 flex flex-col justify-between">
          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
              Circuit Breaker
            </span>
            <Tooltip content="Emergency stop switch for blockchain payouts." />
          </div>

          <button
            type="button"
            onClick={() => setCircuitBreaker(!circuitBreaker)}
            className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
              circuitBreaker
                ? "bg-rose-500 text-white hover:bg-rose-600"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${circuitBreaker ? "bg-white" : "bg-emerald-400"}`} />
            {circuitBreaker ? "Gateway Paused" : "Gateway Active"}
          </button>
        </div>
      </div>
    </div>
  );
}
