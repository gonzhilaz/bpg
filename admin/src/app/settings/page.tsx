"use client";

import React, { useState } from "react";
import { Sliders, Shield, AlertOctagon, CheckCircle2, Percent, Clock, Zap } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export default function SettingsPage() {
  const { circuitBreaker, setCircuitBreaker } = useAdmin();
  const [feePercent, setFeePercent] = useState("0.40");
  const [minPayout, setMinPayout] = useState("10.00");
  const [invoiceTtl, setInvoiceTtl] = useState("30");
  const [gasBuffer, setGasBuffer] = useState("15");
  const [maintenance, setMaintenance] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Platform Settings & Parameters</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Global commission rates, gas buffer margins, and system emergency switches.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>System parameters updated and synchronized to backend config.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Gateway Economics */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Gateway Economics & Fees</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-400 font-medium">Platform Fee Rate (%)</label>
              <div className="relative">
                <input
                  type="text"
                  value={feePercent}
                  onChange={(e) => setFeePercent(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">%</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-medium">Min Settlement (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">$</span>
                <input
                  type="text"
                  value={minPayout}
                  onChange={(e) => setMinPayout(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-7 pr-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-medium">Invoice Expiry (Minutes)</label>
              <div className="relative">
                <input
                  type="text"
                  value={invoiceTtl}
                  onChange={(e) => setInvoiceTtl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Gas Buffers */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Gas Multipliers & Buffering</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-400 font-medium">Sweep Gas Price Buffer (%)</label>
              <div className="relative">
                <input
                  type="text"
                  value={gasBuffer}
                  onChange={(e) => setGasBuffer(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">%</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Added on top of base network gas to guarantee next-block inclusion.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-medium">TRON Energy Delegation</label>
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono">
                32,000 Energy / Sweep
              </div>
              <p className="text-[11px] text-zinc-500">
                Staked TRX energy delegation for fee-less TRC20 token transfers.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Controls */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-semibold text-white">Emergency Controls</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <div>
                <div className="text-xs font-semibold text-white">Circuit Breaker Payout Halt</div>
                <div className="text-[11px] text-zinc-400">
                  Immediately freezes automated sweep transactions and hot wallet broadcasts.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCircuitBreaker(!circuitBreaker)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  circuitBreaker
                    ? "bg-rose-500 text-white"
                    : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                {circuitBreaker ? "HALTED" : "NORMAL"}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
              <div>
                <div className="text-xs font-semibold text-white">Maintenance Mode</div>
                <div className="text-[11px] text-zinc-400">
                  Suspends checkout creation across all merchant stores.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMaintenance(!maintenance)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  maintenance
                    ? "bg-amber-500 text-zinc-950"
                    : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                {maintenance ? "MAINTENANCE" : "LIVE"}
              </button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 text-xs font-bold transition-colors"
          >
            Save Parameters
          </button>
        </div>
      </form>
    </div>
  );
}

