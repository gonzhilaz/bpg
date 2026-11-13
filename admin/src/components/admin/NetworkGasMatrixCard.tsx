"use client";

import React, { useState } from "react";
import { Activity, RefreshCw, Gauge, DollarSign } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import { IconButton } from "../ui/IconButton";
import { NetworkGasItem } from "../../types/admin";
import { mockNetworkGasList } from "../../mocks/mockAdmin";

interface Props {
  rates?: NetworkGasItem[];
}

export function NetworkGasMatrixCard({ rates = mockNetworkGasList }: Props) {
  const [items, setItems] = useState<NetworkGasItem[]>(rates);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Gas & Price Matrix</h2>
          <Tooltip content="Live on-chain gas metrics and native coin prices used for sweeping cost estimations." />
        </div>

        <IconButton
          icon={RefreshCw}
          tooltip="Refresh gas rates"
          onClick={handleRefresh}
          className={isRefreshing ? "animate-spin text-cyan-400" : ""}
          size="sm"
        />
      </div>

      {/* 4-Column Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <div
            key={item.network}
            className="bg-zinc-950/70 border border-zinc-800/90 rounded-xl p-3.5 space-y-3 hover:border-zinc-700 transition-colors"
          >
            {/* Top row: Network badge & Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                {item.network}
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <Activity className="w-2.5 h-2.5" />
                {item.status}
              </span>
            </div>

            {/* Price Metric */}
            <div className="space-y-0.5">
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-zinc-400" />
                <span>Coin Price</span>
                <Tooltip content={`Current live ticker for ${item.native_coin}/USDT`} />
              </div>
              <div className="text-base font-bold font-mono text-zinc-100">
                ${item.coin_price_usd}{" "}
                <span className="text-xs font-normal text-zinc-400">{item.native_coin}</span>
              </div>
            </div>

            {/* Gas Metric & Est Fee */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-zinc-500 block font-sans">Network Gas</span>
                <span className="text-zinc-300 font-medium text-[11px]">{item.gas_price_metric}</span>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-zinc-500 font-sans flex items-center justify-end gap-0.5">
                  <span>Sweep Fee</span>
                  <Tooltip content="Estimated cost to sweep received tokens from deposit address to Cold Wallet." />
                </div>
                <span className="text-emerald-400 font-semibold text-[11px]">
                  ~${item.est_sweep_fee_usd}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
