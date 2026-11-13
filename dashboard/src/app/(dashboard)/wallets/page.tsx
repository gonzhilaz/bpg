"use client";

import React from "react";
import { Wallet, ShieldCheck, Flame, Info } from "lucide-react";
import { useEnvironment } from "../../../context/EnvironmentContext";
import { PayoutSettingsCard } from "../../../components/dashboard/PayoutSettingsCard";
import { mockNetworkGasRates } from "../../../mocks/mockMerchant";
import { Tooltip } from "../../../components/ui/Tooltip";

export default function WalletsPage() {
  const { profile } = useEnvironment();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Wallets & Gas Policy</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Configure cold wallet settlement addresses, select fee payer policies, and track live network gas rates.
        </p>
      </div>

      {/* Network Gas & Coin Prices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockNetworkGasRates.map((rate) => (
          <div
            key={rate.network}
            className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white tracking-wider">{rate.network}</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  rate.status === "OPTIMAL"
                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                    : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                }`}
              >
                {rate.status}
              </span>
            </div>

            <div className="space-y-1 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-sans">{rate.native_coin} Price:</span>
                <span className="text-white font-semibold">${rate.coin_price_usd}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-sans">Est. Sweep:</span>
                <span className="text-cyan-400 font-semibold">{rate.est_sweep_fee_usd}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-800">
                <span className="font-sans">Gas Metric:</span>
                <span>{rate.gas_price_metric}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Settings Form */}
      <div className="max-w-3xl">
        <PayoutSettingsCard profile={profile} gasRates={mockNetworkGasRates} />
      </div>

      {/* Advisory Note */}
      <div className="max-w-3xl p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-zinc-200">Security Recommendation: </span>
          Always use hardware wallets (Ledger, Trezor, Keystone) or multi-sig contracts (Safe) as your settlement destination. Never enter exchange deposit addresses that require memo/tags unless verified.
        </div>
      </div>
    </div>
  );
}

