"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Wallet, CheckCircle2, Flame, Layers } from "lucide-react";
import { useEnvironment } from "../../../context/EnvironmentContext";
import { PayoutsTable } from "../../../components/dashboard/PayoutsTable";
import { Tooltip } from "../../../components/ui/Tooltip";

export default function PayoutsPage() {
  const { mode, payouts } = useEnvironment();

  const totalSettled = mode === "LIVE" ? "$500.00" : "$20.00";
  const completedCount = payouts.filter((p) => p.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Payouts & Settlements</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Non-custodial automated sweeping records directly forwarded to your designated cold wallets.
          </p>
        </div>

        <Link
          href="/wallets"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors self-start md:self-auto"
        >
          <Wallet className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cold Wallet Settings</span>
        </Link>
      </div>

      {/* Settlement Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Total Settled
            </span>
            <Tooltip content="Cumulative value of all crypto payments swept to your destination cold wallets" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{totalSettled}</div>
          <div className="text-[11px] text-zinc-500">{completedCount} successful on-chain transfers</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              Settlement Engine
            </span>
            <Tooltip content="Automated sweeper worker moves funds instantly once confirmation threshold is met" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">Automated</div>
          <div className="text-[11px] text-emerald-400 font-medium">100% Non-Custodial Forwarding</div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Network Gas Policy
            </span>
            <Tooltip content="Defines who covers on-chain sweeping gas costs for final cold wallet settlements" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">Configured</div>
          <div className="text-[11px] text-zinc-500">Configurable in Wallets & Gas</div>
        </div>
      </div>

      {/* Non-Custodial Assurance Notice */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/30 flex items-start gap-3 text-xs text-cyan-300">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Direct Cold Wallet Delivery: </span>
          Captain Gateway never pools customer deposits in a central custody account. Funds are forwarded directly from the temporary payment address to your cold wallet via signed on-chain transactions.
        </div>
      </div>

      {/* Payouts Table */}
      <PayoutsTable payouts={payouts} />
    </div>
  );
}
