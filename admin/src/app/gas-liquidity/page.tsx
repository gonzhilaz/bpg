"use client";

import React, { useState } from "react";
import { Flame, Gauge, Play, ShieldAlert, CheckCircle2, RotateCw } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { HotWalletGasCard } from "../../components/admin/HotWalletGasCard";
import { NetworkGasMatrixCard } from "../../components/admin/NetworkGasMatrixCard";

export default function GasLiquidityPage() {
  const { hotWallets, gasRates } = useAdmin();
  const [selectedChain, setSelectedChain] = useState<string>("ALL");
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepResult, setSweepResult] = useState<string | null>(null);

  const handleManualSweep = () => {
    setIsSweeping(true);
    setSweepResult(null);
    setTimeout(() => {
      setIsSweeping(false);
      setSweepResult(`Successfully swept 3 invoices on ${selectedChain === "ALL" ? "all networks" : selectedChain}. Tx broadcasted.`);
      setTimeout(() => setSweepResult(null), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Gas Liquidity & Sweeper Engine</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Monitor master hot wallet fuel balances, TRON Energy delegations, and trigger automated sweeping batches.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Networks</option>
            <option value="TRON">TRON</option>
            <option value="BSC">BSC</option>
            <option value="POLYGON">Polygon</option>
            <option value="SOLANA">Solana</option>
          </select>

          <button
            type="button"
            onClick={handleManualSweep}
            disabled={isSweeping}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSweeping ? "animate-spin" : ""}`} />
            <span>{isSweeping ? "Sweeping..." : "Trigger Sweep"}</span>
          </button>
        </div>
      </div>

      {sweepResult && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{sweepResult}</span>
        </div>
      )}

      {/* Hot Wallet Gas Card */}
      <HotWalletGasCard wallets={hotWallets} />

      {/* Network Gas & Coin Price Matrix */}
      <NetworkGasMatrixCard rates={gasRates} />

      {/* Gas Policy Explanation */}
      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2 text-xs text-zinc-400 leading-relaxed">
        <div className="font-semibold text-white flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Automated Gas Dispenser Architecture</span>
        </div>
        <p>
          Deposit addresses are generated ephemerally without native gas. When an invoice payment is detected, the gateway&apos;s background engine automatically transfers native fuel (BNB, POL, SOL) or delegates TRON Energy to the deposit address before broadcasting the forwarding transaction to the merchant&apos;s cold wallet.
        </p>
      </div>
    </div>
  );
}

