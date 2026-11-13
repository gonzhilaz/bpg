"use client";

import React, { useState } from "react";
import { DollarSign, Download, TrendingUp, Layers, Flame, Percent } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";

export function FinancialReportCard() {
  const [dateRange, setDateRange] = useState<"7D" | "30D" | "ALL">("30D");

  const reports = {
    "7D": {
      grossVolume: "$1,850.00",
      netSettled: "$1,842.60",
      platformFee: "$7.40",
      gasFeesPaid: "$0.42",
      payoutsCount: 8,
      avgOrder: "$231.25",
    },
    "30D": {
      grossVolume: "$8,420.00",
      netSettled: "$8,386.32",
      platformFee: "$33.68",
      gasFeesPaid: "$1.85",
      payoutsCount: 36,
      avgOrder: "$233.88",
    },
    ALL: {
      grossVolume: "$24,500.00",
      netSettled: "$24,402.00",
      platformFee: "$98.00",
      gasFeesPaid: "$5.10",
      payoutsCount: 112,
      avgOrder: "$218.75",
    },
  };

  const current = reports[dateRange];

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Amount\n" +
      `Gross Volume,${current.grossVolume}\n` +
      `Net Settled,${current.netSettled}\n` +
      `Platform Fee (0.4%),${current.platformFee}\n` +
      `Gas Fees Paid,${current.gasFeesPaid}\n` +
      `Settlement Transfers,${current.payoutsCount}\n` +
      `Average Order Value,${current.avgOrder}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financial_report_${dateRange.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Financial Ledger</h2>
          <Tooltip content="Audited accounting metrics of gross sales, platform fees, and network gas deductions." />
        </div>

        <div className="flex items-center gap-2">
          {/* Range Pills */}
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-0.5 text-[11px] font-medium">
            {(["7D", "30D", "ALL"] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDateRange(range)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  dateRange === range
                    ? "bg-zinc-800 text-white font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
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

      {/* Metrics 4-Box Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        {/* Gross Sales */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 space-y-1">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-medium flex items-center justify-between">
            <span>Gross Sales</span>
            <DollarSign className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white">{current.grossVolume}</div>
          <div className="text-[10px] text-zinc-500 font-sans">{current.payoutsCount} settlements</div>
        </div>

        {/* Net Settled */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 space-y-1">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-medium flex items-center justify-between">
            <span>Net Settled</span>
            <Layers className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400">{current.netSettled}</div>
          <div className="text-[10px] text-zinc-500 font-sans">Cold wallet received</div>
        </div>

        {/* Platform Fee */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 space-y-1">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-medium flex items-center justify-between">
            <span className="flex items-center gap-1">
              Fee (0.4%)
              <Tooltip content="Platform gateway processing commission." />
            </span>
            <Percent className="w-3 h-3 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-indigo-300">{current.platformFee}</div>
          <div className="text-[10px] text-zinc-500 font-sans">Avg {current.avgOrder}/tx</div>
        </div>

        {/* Gas Incurred */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 space-y-1">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans font-medium flex items-center justify-between">
            <span className="flex items-center gap-1">
              Sweep Gas
              <Tooltip content="Estimated blockchain network fees incurred during auto-forwarding." />
            </span>
            <Flame className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-300">{current.gasFeesPaid}</div>
          <div className="text-[10px] text-zinc-500 font-sans">Multi-chain total</div>
        </div>
      </div>
    </div>
  );
}

