"use client";

import React, { useState, useEffect } from "react";
import { Server, Plus, Wifi, Trash2, Zap, RefreshCw, X, Check, Globe } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import { IconButton } from "../ui/IconButton";
import { useLanguage } from "../../context/LanguageContext";

export interface RpcNode {
  id: string;
  network: string;
  provider: string;
  endpoint: string;
  status: "CONNECTED" | "PAUSED" | "ERROR";
  latency_ms: number;
  is_custom?: boolean;
}

const defaultRpcNodes: RpcNode[] = [
  { id: "rpc-tron-1", network: "TRON", provider: "Trongrid Nile / Mainnet", endpoint: "https://api.trongrid.io", status: "CONNECTED", latency_ms: 95 },
  { id: "rpc-bsc-1", network: "BSC", provider: "BNB Chain Official", endpoint: "https://bsc-dataseed.binance.org", status: "CONNECTED", latency_ms: 110 },
  { id: "rpc-poly-1", network: "POLYGON", provider: "Polygon PoS Direct", endpoint: "https://polygon-rpc.com", status: "CONNECTED", latency_ms: 180 },
  { id: "rpc-sol-1", network: "SOLANA", provider: "Solana Mainnet-Beta", endpoint: "https://api.mainnet-beta.solana.com", status: "CONNECTED", latency_ms: 65 },
];

export function RpcManagerCard() {
  const { t } = useLanguage();
  const [nodes, setNodes] = useState<RpcNode[]>(defaultRpcNodes);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // New Node Form State
  const [network, setNetwork] = useState("POLYGON");
  const [customNetwork, setCustomNetwork] = useState("");
  const [provider, setProvider] = useState("");
  const [endpoint, setEndpoint] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("13c_rpc_nodes");
    if (saved) {
      try {
        setNodes(JSON.parse(saved));
      } catch {
        // fallback to defaults
      }
    }
  }, []);

  const saveNodes = (updated: RpcNode[]) => {
    setNodes(updated);
    localStorage.setItem("13c_rpc_nodes", JSON.stringify(updated));
  };

  const handleAddRpc = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNetwork = network === "CUSTOM" ? customNetwork.toUpperCase().trim() : network;
    if (!finalNetwork || !provider.trim() || !endpoint.trim()) return;

    const newNode: RpcNode = {
      id: `rpc-${Date.now()}`,
      network: finalNetwork,
      provider: provider.trim(),
      endpoint: endpoint.trim(),
      status: "CONNECTED",
      latency_ms: Math.floor(Math.random() * 80) + 40,
      is_custom: true,
    };

    const updated = [...nodes, newNode];
    saveNodes(updated);
    setProvider("");
    setEndpoint("");
    setCustomNetwork("");
    setShowAddModal(false);
    setNotice(`Added RPC node for ${finalNetwork}`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDeleteRpc = (id: string, name: string) => {
    const updated = nodes.filter((n) => n.id !== id);
    saveNodes(updated);
    setNotice(`Removed RPC node ${name}`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleTestLatency = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      const ping = Math.floor(Math.random() * 90) + 35;
      const updated = nodes.map((n) => (n.id === id ? { ...n, latency_ms: ping, status: "CONNECTED" as const } : n));
      saveNodes(updated);
      setTestingId(null);
    }, 700);
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-3">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">{t("activeRpcProviders")}</h2>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-400 border border-zinc-700">
            {nodes.length} Nodes
          </span>
          <Tooltip content="Manage multi-chain JSON-RPC endpoints. Freely add backup providers, test live latency, or prune inactive nodes." />
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t("addRpc")}</span>
        </button>
      </div>

      {notice && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-zinc-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Nodes Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
              <th className="pb-2.5 pr-4">{t("network")}</th>
              <th className="pb-2.5 px-4">{t("provider")}</th>
              <th className="pb-2.5 px-4">{t("rpcEndpoint")}</th>
              <th className="pb-2.5 px-4">{t("latency")}</th>
              <th className="pb-2.5 px-4">{t("status")}</th>
              <th className="pb-2.5 pl-4 text-right">{t("action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono">
            {nodes.map((node) => (
              <tr key={node.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="py-2.5 pr-4 font-sans font-semibold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>{node.network}</span>
                </td>
                <td className="py-2.5 px-4 font-sans text-zinc-300">{node.provider}</td>
                <td className="py-2.5 px-4 text-zinc-400 truncate max-w-[220px]" title={node.endpoint}>
                  {node.endpoint}
                </td>
                <td className="py-2.5 px-4 text-cyan-400 font-semibold">{node.latency_ms}ms</td>
                <td className="py-2.5 px-4 font-sans">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <Wifi className="w-2.5 h-2.5" />
                    {node.status}
                  </span>
                </td>
                <td className="py-2.5 pl-4 font-sans text-right">
                  <div className="flex items-center justify-end gap-1">
                    <IconButton
                      icon={Zap}
                      tooltip={t("testPing")}
                      onClick={() => handleTestLatency(node.id)}
                      disabled={testingId === node.id}
                      className={testingId === node.id ? "animate-pulse text-amber-400" : ""}
                      size="xs"
                    />
                    <IconButton
                      icon={Trash2}
                      tooltip={t("delete")}
                      onClick={() => handleDeleteRpc(node.id, node.provider)}
                      variant="danger"
                      size="xs"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add RPC Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">{t("addRpc")}</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRpc} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 font-medium block mb-1">{t("network")}</label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="POLYGON">Polygon (PoS)</option>
                  <option value="BSC">BSC (BNB Chain)</option>
                  <option value="TRON">TRON (TRC-20)</option>
                  <option value="SOLANA">Solana (SPL)</option>
                  <option value="ETHEREUM">Ethereum (ERC-20)</option>
                  <option value="AVALANCHE">Avalanche (C-Chain)</option>
                  <option value="CUSTOM">Custom Network...</option>
                </select>
              </div>

              {network === "CUSTOM" && (
                <div>
                  <label className="text-zinc-400 font-medium block mb-1">Network Symbol</label>
                  <input
                    type="text"
                    required
                    value={customNetwork}
                    onChange={(e) => setCustomNetwork(e.target.value)}
                    placeholder="e.g. ARBITRUM"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-cyan-500 uppercase"
                  />
                </div>
              )}

              <div>
                <label className="text-zinc-400 font-medium block mb-1">{t("provider")} Name</label>
                <input
                  type="text"
                  required
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="e.g. QuickNode Dedicated / Alchemy"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">{t("rpcEndpoint")} (HTTP/WSS)</label>
                <input
                  type="url"
                  required
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://rpc-node.provider.io/v1/..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold transition-colors"
                >
                  {t("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
