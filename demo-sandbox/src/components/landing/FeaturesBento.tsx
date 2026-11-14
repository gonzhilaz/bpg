"use client";

import React from "react";
import {
  Link2,
  Zap,
  Coins,
  ShieldCheck,
  RotateCw,
  Sliders,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Tooltip } from "../ui/Tooltip";

export function FeaturesBento() {
  return (
    <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>Complete Feature Matrix</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Everything You Expect from OxaPay, Built For Complete Sovereignty
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mx-auto">
          From no-code payment links to automated gas-optimized sweeping and real-time SSE push
          telemetry.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Feature 1: Payment Links (No-Code Invoicing) */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Link2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>No-Code Payment Links</span>
              <Tooltip content="Shareable payment URLs for social selling, messaging apps, and instant invoicing." />
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Create static or open-amount payment links in seconds (`/pay/pl_xxx`). Share on
              Telegram, WhatsApp, or invoices without touching any code.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 font-mono text-[11px] text-cyan-300">
            https://yourgateway.com/pay/pl_premium_tier
          </div>
        </div>

        {/* Feature 2: Real-Time SSE Stream */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Sub-Second SSE Stream</span>
              <Tooltip content="Server-Sent Events push live tx updates straight to the checkout UI without polling." />
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Eliminate clunky client polling. The instant a mempool transaction is broadcast,
              Server-Sent Events update the checkout modal in under 1 second.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>data: {`{"status":"DETECTED","confs":1}`}</span>
          </div>
        </div>

        {/* Feature 3: Webhook Replay & Debugging Console */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <RotateCw className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Webhook Replay Console</span>
              <Tooltip content="Debug, inspect HMAC signatures, and re-transmit webhooks with a single click." />
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Full visibility into delivered HTTP callbacks. Inspect payload JSON, HMAC-SHA256
              signatures, and re-transmit failed callbacks with 1 click.
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-t border-zinc-800 pt-2">
            <span>HMAC-SHA256 Signed</span>
            <span className="text-emerald-400">Replay: Active</span>
          </div>
        </div>

        {/* Feature 4: Multi-Chain USDT & Gas Sweeper */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Automated Sweeper Engine</span>
              <Tooltip content="Batches deposit UTXO/token balances into merchant treasury with low network fees." />
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Consolidate customer deposits from ephemeral addresses directly to cold storage.
              Automated gas station funds fee delegation for frictionless sweeps.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span className="px-2 py-0.5 rounded bg-zinc-800 font-mono">BSC</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 font-mono">TRON</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 font-mono">Polygon</span>
            <span className="px-2 py-0.5 rounded bg-zinc-800 font-mono">Solana</span>
          </div>
        </div>

        {/* Feature 5: Security & 2FA Google Authenticator */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>2FA Google Authenticator</span>
              <Tooltip content="RFC 6238 compliant TOTP prevents unauthorized merchant dashboard logins." />
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Protect API keys and payout configurations with hardware-grade TOTP multi-factor
              authentication compatible with Google Authenticator and Authy.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-teal-400">
            <ShieldCheck className="w-4 h-4" />
            <span>RFC 6238 Standard (6-digit TOTP)</span>
          </div>
        </div>

        {/* Feature 6: Dynamic Grace Period & Tolerance */}
        <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Configurable Margins</span>
              <Tooltip content="Customize underpaid tolerance 0-100% and dynamic grace periods per merchant." />
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Set exact underpayment tolerance (0% for strict settlement, or up to 5% for gas
              variance) plus dynamic grace periods for slow blockchain blocks.
            </p>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>Tolerance: 0.00% - 100%</span>
            <span className="text-blue-400">Configurable</span>
          </div>
        </div>
      </div>
    </section>
  );
}
