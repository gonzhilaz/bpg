"use client";

import React, { useState } from "react";
import { DollarSign, Download, TrendingUp, Layers, Flame, Percent } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";

export function PlatformFinancialReportCard() {
  const [filterPeriod, setFilterPeriod] = useState<"7D" | "30D" | "ALL">("30D");

  const reports = {
    "7D": {
      grossVolume: "$34,200.00",
      feeRevenue: "$136.80",
      hotWalletGasSpent: "$4.10",
      netProfit: "$132.70",
      totalTransactions: 240,
    },
    "30D": {
      grossVolume: "$124,500.00",
      feeRevenue: "$498.00",
      hotWalletGasSpent: "$14.80",
      netProfit: "$483.20",
      totalTransactions: 860,
    },
    ALL: {
      grossVolume: "$248,500.00",
      feeRevenue: "$994.00",
      hotWalletGasSpent: "$29.40",
      netProfit: "$964.60",
      totalTransactions: 1840,
    },
  };

  const current = reports[filterPeriod];

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Amount\n" +
      `Gross Platform Volume,${current.grossVolume}\n` +
      `Platform Fee Revenue (0.4%),${current.feeRevenue}\n` +
      `Hot Wallet Gas Consumed,${current.hotWalletGasSpent}\n` +
      `Net Gateway Profit,${current.netProfit}\n` +
      `Total Completed Transactions,${current.totalTransactions}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `platform_revenue_report_${filterPeriod.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Financial Revenue & Margin</h2>
          <Tooltip content="Audited global platform volume, 0.4% platform fee collection, and net gateway profitability." />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-0.5 text-[11px] font-medium">
            {(["7D", "30D", "ALL"] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setFilterPeriod(period)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterPeriod === period
                    ? "bg-zinc-800 text-white font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4-Box Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        {/* Gross Volume */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 space-y-1">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-medium flex items-center justify-between">
            <span>Gross Volume</span>
            <DollarSign className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white">{current.grossVolume}</div>
          <div className="text-[10px] text-zinc-500 font-sans">{current.totalTransactions} transactions</div>
        </div>

        {/* Platform Fee Collected */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 space-y-1">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-medium flex items-center justify-between">
            <span className="flex items-center gap-1">
              Fee Cut (0.4%)
              <Tooltip content="Platform commission collected directly from gross payments." />
            </span>
            <Percent className="w-3 h-3 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-indigo-300">{current.feeRevenue}</div>
          <div className="text-[10px] text-zinc-500 font-sans">Accumulated gross fee</div>
        </div>

        {/* Gas Expended */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 space-y-1">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-medium flex items-center justify-between">
            <span className="flex items-center gap-1">
              Gas Expended
              <Tooltip content="Total native blockchain gas consumed by hot wallets to sweep funds." />
            </span>
            <Flame className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-300">{current.hotWalletGasSpent}</div>
          <div className="text-[10px] text-zinc-500 font-sans">BNB, POL, TRX, SOL</div>
        </div>

        {/* Net Profit */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 space-y-1">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-medium flex items-center justify-between">
            <span>Net Profit</span>
            <Layers className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400">{current.netProfit}</div>
          <div className="text-[10px] text-zinc-500 font-sans">Net platform margin</div>
        </div>
      </div>
    </div>
  );
}
