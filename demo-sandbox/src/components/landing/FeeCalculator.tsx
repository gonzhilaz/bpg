"use client";

import React, { useState } from "react";
import { Calculator, DollarSign, ArrowUpRight, CheckCircle2, TrendingUp } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";

export function FeeCalculator() {
  const [monthlyVolume, setMonthlyVolume] = useState<number>(50000);

  // Fee calculation formulas
  const bpgFee = 0;
  const oxaPayFee = Math.round(monthlyVolume * 0.007); // ~0.7% average
  const nowPaymentsFee = Math.round(monthlyVolume * 0.008); // 0.5% + custodial network spread
  const stripeFee = Math.round(monthlyVolume * 0.029 + (monthlyVolume / 50) * 0.3); // 2.9% + $0.30 / $50 avg ticket

  const monthlySavings = oxaPayFee;
  const yearlySavings = monthlySavings * 12;

  const presets = [10000, 25000, 50000, 100000, 250000];

  return (
    <section id="calculator" className="py-16 border-t border-zinc-800/80 bg-zinc-950/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Fee Calculator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Stop Paying Middleman Gateways 0.5% – 1% of Your GMV
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            See how much you save every single month by switching to 13C&apos;s 0% commission
            self-hosted infrastructure.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
          {/* Slider & Presets */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-300">
                Monthly Processing Volume (USD)
              </span>
              <span className="text-2xl font-extrabold text-white font-mono">
                ${monthlyVolume.toLocaleString()}
              </span>
            </div>

            <input
              type="range"
              min={5000}
              max={500000}
              step={5000}
              value={monthlyVolume}
              onChange={(e) => setMonthlyVolume(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-zinc-500">Presets:</span>
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMonthlyVolume(val)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                    monthlyVolume === val
                      ? "bg-cyan-500 text-zinc-950 font-bold"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  ${(val / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>

          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* 13C Gateway */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-cyan-950/40 to-emerald-950/20 border-2 border-cyan-500/50 relative overflow-hidden shadow-lg shadow-cyan-950/30">
              <div className="absolute top-0 right-0 bg-cyan-500 text-zinc-950 font-extrabold text-[9px] px-2 py-0.5 rounded-bl">
                BEST ROI
              </div>
              <div className="text-xs font-bold text-cyan-400">13C Gateway</div>
              <div className="text-2xl font-extrabold text-white font-mono mt-2">
                ${bpgFee.toFixed(2)}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>0.00% Platform Fee</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-2">100% Direct-to-Wallet</div>
            </div>

            {/* OxaPay */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <div className="text-xs font-semibold text-zinc-300">OxaPay</div>
              <div className="text-2xl font-bold text-zinc-200 font-mono mt-2">
                ${oxaPayFee.toLocaleString()}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">~0.70% Avg Cut</div>
              <div className="text-[10px] text-zinc-500 mt-2">Custodial holding wallet</div>
            </div>

            {/* NOWPayments */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <div className="text-xs font-semibold text-zinc-300">NOWPayments</div>
              <div className="text-2xl font-bold text-zinc-200 font-mono mt-2">
                ${nowPaymentsFee.toLocaleString()}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">~0.80% Custodial</div>
              <div className="text-[10px] text-zinc-500 mt-2">Withdrawal fee spreads</div>
            </div>

            {/* Stripe */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <div className="text-xs font-semibold text-zinc-300">Stripe</div>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-2">
                ${stripeFee.toLocaleString()}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">2.9% + $0.30</div>
              <div className="text-[10px] text-zinc-500 mt-2">High chargeback risk</div>
            </div>
          </div>

          {/* Highlight Banner */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-400">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-5 h-5 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-white">Estimated Annual Savings: </span>
                <span className="font-mono font-extrabold text-emerald-300">
                  ${yearlySavings.toLocaleString()} / year
                </span>{" "}
                vs typical crypto gateways.
              </div>
            </div>

            <a
              href="#features"
              className="text-xs font-bold text-emerald-300 hover:text-white underline inline-flex items-center gap-1"
            >
              <span>See How It Works</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
