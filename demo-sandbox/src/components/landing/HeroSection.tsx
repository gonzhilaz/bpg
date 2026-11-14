"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Lock,
  Layers,
  Coins,
} from "lucide-react";
import { getEnvUrl } from "../../utils/env";

export function HeroSection() {
  return (
    <section className="relative pt-20 pb-16 overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-emerald-500/10 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-medium">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sovereign Web3 Payment Infrastructure</span>
          <span className="text-zinc-600">•</span>
          <span className="font-mono text-[11px] text-emerald-400">0% Commission</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Accept Crypto Payments Directly to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Your Own Wallets
          </span>
          .
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          The sovereign, non-custodial alternative to OxaPay and NOWPayments. Keep 100% of your
          revenue with zero platform cut, real-time SSE payment detection, and zero risk of custodial
          account freezes.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/sandbox"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-zinc-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-lg shadow-cyan-500/15 active:scale-95"
          >
            <Terminal className="w-4 h-4" />
            <span>Try Live Sandbox Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <a
            href={getEnvUrl.merchant()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-zinc-700/80 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-all hover:border-zinc-600"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Open Merchant Portal</span>
          </a>
        </div>

        {/* Trust Points */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero KYC Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>No Account Freezing Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>No Monthly Subscriptions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Source & Self-Hosted</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-mono">
              0%
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">Platform Fee</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Keep 100% of sales</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              &lt; 1s
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">SSE Detection</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Real-time push events</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              4 Chains
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">Multi-Chain USDT</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">BSC, TRON, MATIC, SOL</div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
              100%
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">Non-Custodial</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Direct to your wallet</div>
          </div>
        </div>
      </div>
    </section>
  );
}

