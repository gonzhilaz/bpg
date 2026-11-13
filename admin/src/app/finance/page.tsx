"use client";

import React from "react";
import { TrendingUp, Layers, DollarSign, Percent, Flame } from "lucide-react";
import { PlatformFinancialReportCard } from "../../components/admin/PlatformFinancialReportCard";

export default function FinancePage() {
  const chainBreakdown = [
    { network: "TRON (USDT-TRC20)", volume: "$165,000.00", fee: "$660.00", gas: "$18.20", margin: "$641.80" },
    { network: "BSC (USDT-BEP20)", volume: "$48,500.00", fee: "$194.00", gas: "$6.50", margin: "$187.50" },
    { network: "POLYGON (USDT-POL)", volume: "$22,000.00", fee: "$88.00", gas: "$3.80", margin: "$84.20" },
    { network: "SOLANA (USDT/SOL)", volume: "$13,000.00", fee: "$52.00", gas: "$0.90", margin: "$51.10" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Platform Revenue & Margin Ledger</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Audited global platform turnover, 0.4% platform fee collections, gas expenditures, and net operational margins.
        </p>
      </div>

      {/* Main Financial Card */}
      <PlatformFinancialReportCard />

      {/* Blockchain Network Breakdown */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Network Revenue Breakdown</h2>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Real-time Attribution</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-sans font-medium">
                <th className="pb-3 pr-4">Network</th>
                <th className="pb-3 px-4">Volume (USD)</th>
                <th className="pb-3 px-4">Platform Fee (0.4%)</th>
                <th className="pb-3 px-4">Gas Expended</th>
                <th className="pb-3 pl-4">Net Gateway Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {chainBreakdown.map((row) => (
                <tr key={row.network} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 pr-4 font-sans font-semibold text-white">{row.network}</td>
                  <td className="py-3 px-4 text-zinc-200">{row.volume}</td>
                  <td className="py-3 px-4 text-emerald-400 font-medium">{row.fee}</td>
                  <td className="py-3 px-4 text-amber-400">{row.gas}</td>
                  <td className="py-3 pl-4 text-cyan-400 font-bold">{row.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
