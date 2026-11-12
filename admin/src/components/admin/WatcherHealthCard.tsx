import React from "react";
import { Activity, CheckCircle2 } from "lucide-react";
import { WatcherStatus } from "../../types/admin";
import { Tooltip } from "../ui/Tooltip";

interface Props {
  watchers: WatcherStatus[];
}

export function WatcherHealthCard({ watchers }: Props) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Multi-Chain Indexers</h2>
          <Tooltip content="Live background daemons monitoring blockchain RPC logs." />
        </div>
        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          4 Nodes Synced
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {watchers.map((w) => (
          <div
            key={w.network}
            className="p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-700/50 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200">{w.network}</span>
              <span className="text-[10px] font-mono text-zinc-400">{w.latency_ms}ms</span>
            </div>

            <div className="space-y-0.5">
              <div className="text-sm font-bold font-mono text-cyan-400 truncate">
                {w.current_block}
              </div>
              <div className="text-[10px] text-zinc-500">Updated {w.last_block_time}</div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Scanning Blocks</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
