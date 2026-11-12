import React from "react";
import { Flame, AlertTriangle, CheckCircle2 } from "lucide-react";
import { HotWalletBalance } from "../../types/admin";
import { Tooltip } from "../ui/Tooltip";

interface Props {
  wallets: HotWalletBalance[];
}

export function HotWalletGasCard({ wallets }: Props) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Hot Wallet Gas Reserves</h2>
          <Tooltip content="Operational native gas balances used for instant payouts and deposit sweeping." />
        </div>
        <span className="text-xs text-zinc-500">Auto-Dispenser Active</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {wallets.map((w) => {
          const isLow = w.status === "LOW";
          return (
            <div
              key={w.network}
              className={`p-3.5 rounded-xl border space-y-2 transition-colors ${
                isLow
                  ? "bg-amber-950/20 border-amber-800/40"
                  : "bg-zinc-800/40 border-zinc-700/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200">{w.network}</span>
                {isLow ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    Low Gas
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Optimal
                  </span>
                )}
              </div>

              <div>
                <div className="text-lg font-bold font-mono text-white tracking-tight">
                  {w.balance}
                </div>
                <div className="text-[11px] text-zinc-400">{w.usd_value}</div>
              </div>

              {w.energy_delegated && (
                <div className="text-[10px] text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-md truncate">
                  {w.energy_delegated}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

