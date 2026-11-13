"use client";

import React, { useState } from "react";
import { Activity, RefreshCw, Server, Wifi, CheckCircle2, Terminal } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { WatcherHealthCard } from "../../components/admin/WatcherHealthCard";

export default function WatchersPage() {
  const { watchers } = useAdmin();
  const [restarting, setRestarting] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const rpcNodes = [
    { network: "TRON", provider: "Trongrid RPC / Nile Testnet", endpoint: "https://api.trongrid.io", status: "CONNECTED" },
    { network: "BSC", provider: "BNB Chain Official RPC", endpoint: "https://bsc-dataseed.binance.org", status: "CONNECTED" },
    { network: "POLYGON", provider: "Polygon PoS RPC", endpoint: "https://polygon-rpc.com", status: "CONNECTED" },
    { network: "SOLANA", provider: "Solana Mainnet-Beta RPC", endpoint: "https://api.mainnet-beta.solana.com", status: "CONNECTED" },
  ];

  const handleRestart = (net: string) => {
    setRestarting(net);
    setStatusMsg(null);
    setTimeout(() => {
      setRestarting(null);
      setStatusMsg(`${net} Indexer process gracefully restarted.`);
      setTimeout(() => setStatusMsg(null), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Multi-Chain Watchers & Node Indexers</h1>
        <p className="text-xs text-zinc-400 mt-1">
          High-performance background workers listening for blockchain deposit events without smart contracts.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main Watchers Grid */}
      <WatcherHealthCard watchers={watchers} />

      {/* RPC Endpoints & Node Connectivity Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Active RPC Providers</h2>
          </div>
          <span className="text-xs text-zinc-500 font-mono">WebSockets & JSON-RPC</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
                <th className="pb-3 pr-4">Network</th>
                <th className="pb-3 px-4">Provider</th>
                <th className="pb-3 px-4">Endpoint</th>
                <th className="pb-3 px-4">Connection</th>
                <th className="pb-3 pl-4">Process</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {rpcNodes.map((node) => (
                <tr key={node.network} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 pr-4 font-sans font-semibold text-white">{node.network}</td>
                  <td className="py-3 px-4 font-sans text-zinc-300">{node.provider}</td>
                  <td className="py-3 px-4 text-zinc-400 truncate max-w-[200px]">{node.endpoint}</td>
                  <td className="py-3 px-4 font-sans">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <Wifi className="w-3 h-3" />
                      Connected
                    </span>
                  </td>
                  <td className="py-3 pl-4 font-sans">
                    <button
                      type="button"
                      onClick={() => handleRestart(node.network)}
                      disabled={restarting === node.network}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium border border-zinc-700 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${restarting === node.network ? "animate-spin text-cyan-400" : ""}`} />
                      <span>{restarting === node.network ? "Restarting..." : "Restart"}</span>
                    </button>
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
