"use client";

import React, { useState } from "react";
import { DollarSign, Download, TrendingUp, Layers, Flame, Percent } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import { IconButton } from "../ui/IconButton";
import { StatTile } from "../ui/StatTile";

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
          <IconButton
            icon={Download}
            tooltip="Export CSV ledger"
            onClick={handleExportCSV}
            size="sm"
          />
        </div>
      </div>

      {/* Metrics 4-Box Grid using StatTile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label="Gross Sales"
          value={current.grossVolume}
          icon={DollarSign}
          tooltip="Total cryptocurrency payments received before fees."
          trend={`${current.payoutsCount} txs`}
          trendUp={true}
        />

        <StatTile
          label="Net Settled"
          value={current.netSettled}
          icon={Layers}
          tooltip="Net tokens successfully forwarded to cold wallets."
          trend="Delivered"
          trendUp={true}
        />

        <StatTile
          label="Fee (0.4%)"
          value={current.platformFee}
          icon={Percent}
          tooltip="Flat 0.4% platform gateway service commission."
          trend="0.40%"
          trendUp={true}
        />

        <StatTile
          label="Sweep Gas"
          value={current.gasFeesPaid}
          icon={Flame}
          tooltip="Blockchain gas costs consumed during automated sweeping."
          trend="Network"
          trendUp={false}
        />
      </div>
    </div>
  );
}
