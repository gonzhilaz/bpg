"use client";

import React, { useState } from "react";
import { Activity, RefreshCw, Server, Wifi, CheckCircle2 } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { WatcherHealthCard } from "../../components/admin/WatcherHealthCard";
import { IconButton } from "../../components/ui/IconButton";
import { Tooltip } from "../../components/ui/Tooltip";

export default function WatchersPage() {
  const { watchers } = useAdmin();
  const [restarting, setRestarting] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const rpcNodes = [
    { network: "TRON", provider: "Trongrid RPC / Nile", endpoint: "https://api.trongrid.io", status: "CONNECTED" },
    { network: "BSC", provider: "BNB Chain Official", endpoint: "https://bsc-dataseed.binance.org", status: "CONNECTED" },
    { network: "POLYGON", provider: "Polygon PoS RPC", endpoint: "https://polygon-rpc.com", status: "CONNECTED" },
    { network: "SOLANA", provider: "Solana Mainnet RPC", endpoint: "https://api.mainnet-beta.solana.com", status: "CONNECTED" },
  ];

  const handleRestart = (net: string) => {
    setRestarting(net);
    setStatusMsg(null);
    setTimeout(() => {
      setRestarting(null);
      setStatusMsg(`${net} indexer process restarted.`);
      setTimeout(() => setStatusMsg(null), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Multi-Chain Watchers</span>
            <Tooltip content="Independent worker processes scanning blocks on TRON, BSC, Polygon, and Solana." />
          </h1>
          <p className="text-xs text-zinc-400">
            Node RPC health, block scanning latency, and worker process lifecycle.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main Watchers Grid */}
      <WatcherHealthCard watchers={watchers} />

      {/* RPC Endpoints & Node Connectivity Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Active RPC Providers</h2>
            <Tooltip content="Direct JSON-RPC and WebSocket connections powering address transaction listeners." />
          </div>
          <span className="text-xs text-zinc-500 font-mono">WebSockets & JSON-RPC</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
                <th className="pb-2.5 pr-4">Network</th>
                <th className="pb-2.5 px-4">Provider</th>
                <th className="pb-2.5 px-4">Endpoint</th>
                <th className="pb-2.5 px-4">Status</th>
                <th className="pb-2.5 pl-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {rpcNodes.map((node) => (
                <tr key={node.network} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-2.5 pr-4 font-sans font-semibold text-white">{node.network}</td>
                  <td className="py-2.5 px-4 font-sans text-zinc-300">{node.provider}</td>
                  <td className="py-2.5 px-4 text-zinc-400 truncate max-w-[200px]">{node.endpoint}</td>
                  <td className="py-2.5 px-4 font-sans">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <Wifi className="w-2.5 h-2.5" />
                      Connected
                    </span>
                  </td>
                  <td className="py-2.5 pl-4 font-sans text-right">
                    <IconButton
                      icon={RefreshCw}
                      tooltip="Restart indexer process"
                      onClick={() => handleRestart(node.network)}
                      disabled={restarting === node.network}
                      className={restarting === node.network ? "animate-spin text-cyan-400" : ""}
                      size="xs"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
