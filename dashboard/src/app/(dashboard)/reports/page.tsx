"use client";

import React from "react";
import { TrendingUp, ShieldCheck, DollarSign, Percent, Download } from "lucide-react";
import { FinancialReportCard } from "../../../components/dashboard/FinancialReportCard";
import { Tooltip } from "../../../components/ui/Tooltip";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Financial Accounting Ledger</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Detailed revenue breakdowns, platform fee deductions (0.4%), network gas costs, and net settlement reconciliations.
        </p>
      </div>

      {/* Main Financial Report Component */}
      <FinancialReportCard />

      {/* Fee Comparison Card */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Percent className="w-4 h-4 text-emerald-400" />
          <span>Cost Savings vs Traditional Payment Gateways</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5">
            <div className="font-semibold text-zinc-300">Captain Gateway</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">0.40% Flat</div>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              Zero monthly maintenance fees. Zero chargeback fraud risk. Direct non-custodial forwarding to your cold wallet.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5">
            <div className="font-semibold text-zinc-400">Traditional Credit Cards (Stripe / PayPal)</div>
            <div className="text-xl font-bold text-rose-400/90 font-mono">2.90% + $0.30</div>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              High chargeback risks, rolling reserve holds, rolling settlement delays of 2-7 business days, and FX cross-border fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
