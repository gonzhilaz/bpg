"use client";

import React, { useState } from "react";
import { Sliders, Shield, AlertOctagon, CheckCircle2, Percent, Clock, Zap, Save, RefreshCw } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { Tooltip } from "../../components/ui/Tooltip";
import { IconButton } from "../../components/ui/IconButton";

export default function SettingsPage() {
  const { circuitBreaker, setCircuitBreaker } = useAdmin();
  const [feePercent, setFeePercent] = useState("0.40");
  const [minPayout, setMinPayout] = useState("10.00");
  const [invoiceTtl, setInvoiceTtl] = useState("30");
  const [gasBuffer, setGasBuffer] = useState("15");
  const [maintenance, setMaintenance] = useState(false);
  const [webhookRetries, setWebhookRetries] = useState("5");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Header with Save Icon Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Platform Settings</h1>
          <p className="text-xs text-zinc-400">
            Global commission, gas buffer margins, and system emergency switches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
          <button
            onClick={handleSave}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Economics & Gas Multipliers */}
        <div className="space-y-4">
          {/* Gateway Economics */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Gateway Economics</h2>
              </div>
              <Tooltip content="Commission fee margins and invoice settlement threshold rules." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-zinc-400 font-medium">Platform Fee</label>
                  <Tooltip content="Platform commission cut (0.4%) retained from payouts." />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={feePercent}
                    onChange={(e) => setFeePercent(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-[11px]">%</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-zinc-400 font-medium">Min Settlement</label>
                  <Tooltip content="Minimum balance required to trigger automatic payout." />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-[11px]">$</span>
                  <input
                    type="text"
                    value={minPayout}
                    onChange={(e) => setMinPayout(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-6 pr-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-zinc-400 font-medium">Invoice TTL</label>
                  <Tooltip content="Payment detection countdown before invoice expires." />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={invoiceTtl}
                    onChange={(e) => setInvoiceTtl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-[11px]">min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain Gas Buffers */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Gas Buffers</h2>
              </div>
              <Tooltip content="Dynamic multiplier applied to base gas price for next-block inclusion." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-zinc-400 font-medium">Gas Buffer</label>
                  <Tooltip content="Multiplier added on top of base network gas to guarantee fast inclusion." />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={gasBuffer}
                    onChange={(e) => setGasBuffer(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-[11px]">%</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-zinc-400 font-medium">TRON Delegation</label>
                  <Tooltip content="Staked TRX energy delegation pool for fee-less TRC20 token transfers." />
                </div>
                <div className="p-1.5 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-xs">
                  32,000 Energy / Sweep
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Emergency Switches & Webhooks */}
        <div className="space-y-4">
          {/* Emergency Controls */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Emergency Controls</h2>
              </div>
              <Tooltip content="Master kill-switches for platform operations and outgoing payout broadcasts." />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Circuit Breaker</span>
                  <Tooltip content="Immediately freezes automated sweep transactions and hot wallet broadcasts." />
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

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Maintenance Mode</span>
                  <Tooltip content="Suspends checkout creation across all merchant stores." />
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

          {/* Webhook & Network Retries */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Dispatcher Policies</h2>
              </div>
              <Tooltip content="Webhook dispatch retry limits and backoff timing rules." />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-zinc-400 font-medium">Max Retries</label>
                  <Tooltip content="Maximum HTTP delivery attempts for unconfirmed callbacks." />
                </div>
                <input
                  type="number"
                  value={webhookRetries}
                  onChange={(e) => setWebhookRetries(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-zinc-400 font-medium">Backoff Policy</label>
                  <Tooltip content="Exponential backoff algorithm with jitter from 1m to 30m." />
                </div>
                <div className="p-1.5 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-xs">
                  Exponential (1m - 30m)
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
