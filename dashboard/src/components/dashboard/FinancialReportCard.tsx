"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DollarSign, Download, TrendingUp, Layers, Flame, Percent, RefreshCw, AlertCircle } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import { IconButton } from "../ui/IconButton";
import { StatTile } from "../ui/StatTile";
import { MerchantService, FinancialLedgerData } from "../../services/merchantService";

export function FinancialReportCard() {
  const [dateRange, setDateRange] = useState<"7D" | "30D" | "ALL">("30D");
  const [ledger, setLedger] = useState<FinancialLedgerData>({
    range: "30D",
    gross_volume: "$0.00",
    net_settled: "$0.00",
    platform_fee: "$0.00",
    gas_fees_paid: "$0.00",
    payouts_count: 0,
    avg_order: "$0.00",
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLedger = useCallback(async (range: "7D" | "30D" | "ALL") => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await MerchantService.getLedger(range);
      if (res.data) {
        setLedger(res.data);
      } else {
        // If DB has 0 records or error, fallback to zero state gracefully
        setLedger({
          range,
          gross_volume: "$0.00",
          net_settled: "$0.00",
          platform_fee: "$0.00",
          gas_fees_paid: "$0.00",
          payouts_count: 0,
          avg_order: "$0.00",
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load financial ledger");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLedger(dateRange);
  }, [dateRange, fetchLedger]);

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Amount\n" +
      `Gross Volume,${ledger.gross_volume}\n` +
      `Net Settled,${ledger.net_settled}\n` +
      `Fee Gateway (%),${ledger.platform_fee}\n` +
      `Gas Fees Paid,${ledger.gas_fees_paid}\n` +
      `Settlement Transfers,${ledger.payouts_count}\n` +
      `Average Order Value,${ledger.avg_order}\n`;

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
          <Tooltip content="Audited accounting metrics of gross sales, platform fees, and network gas deductions computed from database." />
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

          {/* Refresh Button */}
          <IconButton
            icon={RefreshCw}
            tooltip="Refresh Ledger"
            onClick={() => fetchLedger(dateRange)}
            size="sm"
            className={isLoading ? "animate-spin text-cyan-400" : ""}
          />

          {/* Export CSV Button */}
          <IconButton
            icon={Download}
            tooltip="Export CSV ledger"
            onClick={handleExportCSV}
            size="sm"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchLedger(dateRange)}
            className="underline font-semibold hover:text-amber-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metrics 4-Box Grid using StatTile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label="Gross Sales"
          value={isLoading ? "..." : ledger.gross_volume}
          icon={DollarSign}
          tooltip="Total cryptocurrency payments received before fees."
          trend={`${ledger.payouts_count} txs`}
          trendUp={true}
        />

        <StatTile
          label="Net Settled"
          value={isLoading ? "..." : ledger.net_settled}
          icon={Layers}
          tooltip="Net tokens successfully forwarded to cold wallets."
          trend="Delivered"
          trendUp={true}
        />

        <StatTile
          label="Fee Gateway (%)"
          value={isLoading ? "..." : ledger.platform_fee}
          icon={Percent}
          tooltip="Dynamic platform gateway service commission."
          trend="Configured"
          trendUp={true}
        />

        <StatTile
          label="Sweep Gas"
          value={isLoading ? "..." : ledger.gas_fees_paid}
          icon={Flame}
          tooltip="Blockchain gas costs consumed during automated sweeping."
          trend="Network"
          trendUp={false}
        />
      </div>
    </div>
  );
}
