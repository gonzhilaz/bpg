"use client";

import React, { useState } from "react";
import { DollarSign, Download, TrendingUp, Layers, Flame, Percent } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import { StatTile } from "../ui/StatTile";
import { IconButton } from "../ui/IconButton";

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
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-2.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Revenue & Margin</h2>
          <Tooltip content="Audited global platform volume, 0.4% platform fee collection, and net gateway profitability." />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-0.5 text-[11px] font-medium">
            {(["7D", "30D", "ALL"] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setFilterPeriod(period)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterPeriod === period
                    ? "bg-zinc-800 text-white font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <IconButton
            icon={Download}
            tooltip="Export CSV Report"
            onClick={handleExportCSV}
            variant="primary"
          />
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label="Gross Volume"
          value={current.grossVolume}
          icon={DollarSign}
          tooltip="Gross cumulative cryptocurrency payment volume across all chains."
          subValue={`${current.totalTransactions} transactions`}
        />
        <StatTile
          label="Fee Cut"
          value={current.feeRevenue}
          icon={Percent}
          tooltip="Platform commission collected directly (0.4%) from gross transactions."
          trend="0.4%"
          trendUp={true}
        />
        <StatTile
          label="Gas Spent"
          value={current.hotWalletGasSpent}
          icon={Flame}
          tooltip="Total native blockchain gas consumed by hot wallets to sweep funds."
          subValue="BNB, POL, TRX, SOL"
        />
        <StatTile
          label="Net Margin"
          value={current.netProfit}
          icon={Layers}
          tooltip="Net retained platform revenue after deducting hot wallet gas costs."
          trend="Net Profit"
          trendUp={true}
        />
      </div>
    </div>
  );
}
