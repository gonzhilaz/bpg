"use client";

import React from "react";
import { TrendingUp, Percent, ArrowDownRight } from "lucide-react";
import { FinancialReportCard } from "../../../components/dashboard/FinancialReportCard";
import { Tooltip } from "../../../components/ui/Tooltip";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Financial Accounting</span>
          <Tooltip content="Audited revenue breakdowns, 0.4% platform margin, network gas, and cold wallet settlements." />
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Revenue breakdowns, fee deductions, and net settlement reconciliations.
        </p>
      </div>

      {/* Main Financial Report Component */}
      <FinancialReportCard />

      {/* Fee Comparison Card */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Fee Efficiency</h3>
            <Tooltip content="Flat 0.4% non-custodial crypto settlement vs traditional processor fees." />
          </div>
          <span className="text-xs text-emerald-400 font-semibold font-mono">Save ~85%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">13C Gateway</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">Active</span>
            </div>
            <div className="text-lg font-bold text-emerald-400 font-mono">0.40% Flat</div>
            <div className="text-[11px] text-zinc-500">Zero chargebacks • Instant sweeping</div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-400">Legacy Processors</span>
              <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">Typical</span>
            </div>
            <div className="text-lg font-bold text-rose-400/90 font-mono">2.90% + $0.30</div>
            <div className="text-[11px] text-zinc-500">Chargeback risk • Rolling reserves</div>
          </div>
        </div>
      </div>
    </div>
  );
}
