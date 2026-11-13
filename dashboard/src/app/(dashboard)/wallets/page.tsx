"use client";

import React from "react";
import { Wallet, ShieldCheck, Flame } from "lucide-react";
import { useEnvironment } from "../../../context/EnvironmentContext";
import { PayoutSettingsCard } from "../../../components/dashboard/PayoutSettingsCard";
import { mockNetworkGasRates } from "../../../mocks/mockMerchant";
import { Tooltip } from "../../../components/ui/Tooltip";

export default function WalletsPage() {
  const { profile } = useEnvironment();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span>Wallets & Gas</span>
            <Tooltip content="Security Notice: Always use hardware wallets (Ledger, Trezor) or multi-sig contracts (Safe) as settlement destinations. Never use exchange addresses requiring memo tags." />
          </h1>
          <p className="text-xs text-zinc-400">
            Cold wallet settlement addresses, fee payer rules, and live network gas rates.
          </p>
        </div>
      </div>

      {/* Network Gas & Coin Prices Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {mockNetworkGasRates.map((rate) => (
          <div
            key={rate.network}
            className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white tracking-wider">{rate.network}</span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  rate.status === "OPTIMAL"
                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                    : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                }`}
              >
                {rate.status}
              </span>
            </div>

            <div className="space-y-0.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-sans">{rate.native_coin}:</span>
                <span className="text-white font-semibold">${rate.coin_price_usd}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-sans">Est. Sweep:</span>
                <span className="text-cyan-400 font-semibold">{rate.est_sweep_fee_usd}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Settings Form */}
      <div className="max-w-2xl">
        <PayoutSettingsCard profile={profile} gasRates={mockNetworkGasRates} />
      </div>
    </div>
  );
}
