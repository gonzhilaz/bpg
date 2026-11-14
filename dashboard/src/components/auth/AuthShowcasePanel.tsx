"use client";

import React from "react";
import { Zap, ShieldCheck, Coins, Layers, ArrowUpRight, Cpu } from "lucide-react";

interface Props {
  mode: "login" | "register";
}

export function AuthShowcasePanel({ mode }: Props) {
  return (
    <div className="relative hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-zinc-950 via-zinc-900 to-[#0A101D] border-r border-zinc-800/80 overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand & Tagline */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-cyan-500/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-base font-black tracking-tight text-white flex items-center gap-1.5 font-mono">
              <span>13C</span>
              <span className="text-cyan-400 text-xs px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/50">
                GATEWAY
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Non-Custodial Crypto Infrastructure</p>
          </div>
        </div>

        <div className="pt-6 space-y-2 max-w-md">
          <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
            {mode === "login"
              ? "Welcome back to your merchant command center."
              : "Accept crypto payments with 0.4% flat fees worldwide."}
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Engineered for high-volume commerce with ephemeral deposit isolation, automated batch sweeping, and instant webhook notifications.
          </p>
        </div>
      </div>

      {/* Feature Value Props */}
      <div className="relative z-10 space-y-3 my-8">
        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-0.5">
            <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <span>Industry-Lowest 0.4% Fee</span>
              <span className="text-[10px] text-emerald-400 font-mono px-1.5 py-0.2 rounded bg-emerald-950/40 border border-emerald-800/40">
                SAVE 80%
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Zero monthly subscription fees. Keep 99.6% of every dollar earned across all currencies.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-0.5">
            <div className="font-semibold text-zinc-200">Native Multi-Chain Routing</div>
            <p className="text-[11px] text-zinc-400">
              Accept USDT, USDC, and native tokens across BNB Smart Chain, Polygon, TRON, and Solana seamlessly.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-sm flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-0.5">
            <div className="font-semibold text-zinc-200">Non-Custodial Ephemeral Wallets</div>
            <p className="text-[11px] text-zinc-400">
              Each invoice gets an isolated, unique deposit address protected by AES-256-GCM at-rest encryption.
            </p>
          </div>
        </div>
      </div>

      {/* Trust & SLA Badges */}
      <div className="relative z-10 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>99.99% Uptime SLA</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500">
          <span>Zero Chargebacks</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
        </div>
      </div>
    </div>
  );
}
