"use client";

import React, { useState } from "react";
import { Flame, Gauge, Play, ShieldAlert, CheckCircle2, RotateCw } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { HotWalletGasCard } from "../../components/admin/HotWalletGasCard";
import { NetworkGasMatrixCard } from "../../components/admin/NetworkGasMatrixCard";
import { Tooltip } from "../../components/ui/Tooltip";
import { IconButton } from "../../components/ui/IconButton";

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
      setSweepResult(`Swept invoices on ${selectedChain === "ALL" ? "all networks" : selectedChain}. Tx broadcasted.`);
      setTimeout(() => setSweepResult(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Gas Engine</span>
            <Tooltip content="Automated background engine delegating TRON energy or feeding native gas for token sweeps." />
          </h1>
          <p className="text-xs text-zinc-400">
            Hot wallet fuel balances, TRON Energy, and automated deposit sweeps.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
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
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSweeping ? "animate-spin" : ""}`} />
            <span>{isSweeping ? "Sweeping..." : "Trigger Sweep"}</span>
          </button>
        </div>
      </div>

      {sweepResult && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{sweepResult}</span>
        </div>
      )}

      {/* Hot Wallet Gas Card */}
      <HotWalletGasCard wallets={hotWallets} />

      {/* Network Gas & Coin Price Matrix */}
      <NetworkGasMatrixCard rates={gasRates} />
    </div>
  );
}
