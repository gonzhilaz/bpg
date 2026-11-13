"use client";

import React from "react";
import { TrendingUp, Layers, DollarSign, Percent, Flame } from "lucide-react";
import { PlatformFinancialReportCard } from "../../components/admin/PlatformFinancialReportCard";
import { Tooltip } from "../../components/ui/Tooltip";

export default function FinancePage() {
  const chainBreakdown = [
    { network: "TRON (USDT-TRC20)", volume: "$165,000.00", fee: "$660.00", gas: "$18.20", margin: "$641.80" },
    { network: "BSC (USDT-BEP20)", volume: "$48,500.00", fee: "$194.00", gas: "$6.50", margin: "$187.50" },
    { network: "POLYGON (USDT-POL)", volume: "$22,000.00", fee: "$88.00", gas: "$3.80", margin: "$84.20" },
    { network: "SOLANA (USDT/SOL)", volume: "$13,000.00", fee: "$52.00", gas: "$0.90", margin: "$51.10" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Platform Revenue Ledger</span>
            <Tooltip content="Audited global platform turnover, 0.4% platform fee collections, gas expenditures, and net operational margins." />
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time multi-chain fee attribution and net operational profitability.
          </p>
        </div>
      </div>

      {/* Main Financial Card */}
      <PlatformFinancialReportCard />

      {/* Blockchain Network Breakdown */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Chain Breakdown</h2>
            <Tooltip content="Turnover volume, 0.4% fees, and sweep gas costs itemized per blockchain." />
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">Real-time Attribution</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-sans text-[11px]">
                <th className="pb-2.5 font-semibold">Network</th>
                <th className="pb-2.5 font-semibold text-right">Volume</th>
                <th className="pb-2.5 font-semibold text-right">Fee (0.4%)</th>
                <th className="pb-2.5 font-semibold text-right">Gas Spent</th>
                <th className="pb-2.5 font-semibold text-right">Net Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-[11px]">
              {chainBreakdown.map((row) => (
                <tr key={row.network} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-2.5 font-sans font-semibold text-white">{row.network}</td>
                  <td className="py-2.5 text-right text-zinc-200">{row.volume}</td>
                  <td className="py-2.5 text-right text-emerald-400 font-medium">{row.fee}</td>
                  <td className="py-2.5 text-right text-amber-400">{row.gas}</td>
                  <td className="py-2.5 text-right text-cyan-400 font-bold">{row.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
