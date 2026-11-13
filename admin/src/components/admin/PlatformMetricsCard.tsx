"use client";

import React, { useState } from "react";
import { DollarSign, Percent, Users, AlertOctagon } from "lucide-react";
import { PlatformMetrics } from "../../types/admin";
import { StatTile } from "../ui/StatTile";
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
            <span className="hidden sm:inline text-rose-400/80">• Automatic payouts and sweeping frozen</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          label="Total Volume"
          value={`$${metrics.total_volume_usd}`}
          icon={DollarSign}
          tooltip="Gross cryptocurrency payment volume processed across all merchant stores."
        />

        <StatTile
          label="Fee Revenue"
          value={`$${metrics.platform_fee_revenue_usd}`}
          icon={Percent}
          tooltip="Platform commission (0.4%) automatically retained from settled invoices."
          trend="0.4%"
          trendUp={true}
        />

        <StatTile
          label="Merchants"
          value={metrics.active_merchants_count}
          icon={Users}
          tooltip="Registered merchants with active payment forwarding status."
          trend="100% Active"
          trendUp={true}
        />

        {/* Circuit Breaker Control Card */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold tracking-wider uppercase">
            <div className="flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
              <span>Circuit Breaker</span>
            </div>
            <Tooltip content="Emergency stop switch to freeze automated blockchain payouts and sweeps." />
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
            <span>{circuitBreaker ? "Gateway Paused" : "Gateway Active"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
