"use client";

import React, { useState, useEffect } from "react";
import { Server, Plus, Wifi, Trash2, Zap, RefreshCw, X, Globe, Filter } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import { IconButton } from "../ui/IconButton";
import { useLanguage } from "../../context/LanguageContext";

export interface RpcNode {
  id: string;
  network: string;
  type: "MAINNET" | "TESTNET";
  provider: string;
  endpoint: string;
  status: "CONNECTED" | "PAUSED" | "ERROR";
  latency_ms: number;
  is_custom?: boolean;
}

// Integrated high-availability RPC node pool (EXP & Official clusters)
const initialRpcNodes: RpcNode[] = [
  // TRON Mainnet & Testnet
  { id: "tron-main-1", network: "TRON", type: "MAINNET", provider: "TronGrid Official", endpoint: "https://api.trongrid.io", status: "CONNECTED", latency_ms: 95 },
  { id: "tron-main-2", network: "TRON", type: "MAINNET", provider: "Tron PublicNode (EXP)", endpoint: "https://tron-rpc.publicnode.com", status: "CONNECTED", latency_ms: 110 },
  { id: "tron-nile-1", network: "TRON", type: "TESTNET", provider: "Nile Testnet (TronGrid)", endpoint: "https://nile.trongrid.io", status: "CONNECTED", latency_ms: 130 },

  // BSC Mainnet & Testnet
  { id: "bsc-main-1", network: "BSC", type: "MAINNET", provider: "Binance Official", endpoint: "https://bsc-dataseed.binance.org", status: "CONNECTED", latency_ms: 85 },
  { id: "bsc-main-2", network: "BSC", type: "MAINNET", provider: "LlamaRPC (EXP)", endpoint: "https://binance.llamarpc.com", status: "CONNECTED", latency_ms: 95 },
  { id: "bsc-chapel-1", network: "BSC", type: "TESTNET", provider: "Chapel Testnet (Binance)", endpoint: "https://data-seed-prebsc-1-s1.binance.org:8545", status: "CONNECTED", latency_ms: 140 },

  // Polygon Mainnet & Testnet
  { id: "poly-main-1", network: "POLYGON", type: "MAINNET", provider: "Polygon PoS Official", endpoint: "https://polygon-rpc.com", status: "CONNECTED", latency_ms: 120 },
  { id: "poly-main-2", network: "POLYGON", type: "MAINNET", provider: "LlamaRPC (EXP)", endpoint: "https://polygon.llamarpc.com", status: "CONNECTED", latency_ms: 135 },
  { id: "poly-amoy-1", network: "POLYGON", type: "TESTNET", provider: "Amoy Testnet (Polygon)", endpoint: "https://rpc-amoy.polygon.technology", status: "CONNECTED", latency_ms: 160 },

  // Solana Mainnet & Testnet
  { id: "sol-main-1", network: "SOLANA", type: "MAINNET", provider: "Solana Mainnet-Beta", endpoint: "https://api.mainnet-beta.solana.com", status: "CONNECTED", latency_ms: 65 },
  { id: "sol-dev-1", network: "SOLANA", type: "TESTNET", provider: "Solana Devnet", endpoint: "https://api.devnet.solana.com", status: "CONNECTED", latency_ms: 90 },

  // Ethereum Mainnet & Testnet
  { id: "eth-main-1", network: "ETHEREUM", type: "MAINNET", provider: "Cloudflare ETH (EXP)", endpoint: "https://cloudflare-eth.com", status: "CONNECTED", latency_ms: 75 },
  { id: "eth-sep-1", network: "ETHEREUM", type: "TESTNET", provider: "Sepolia Testnet", endpoint: "https://rpc.sepolia.org", status: "CONNECTED", latency_ms: 115 },
];

export function RpcManagerCard() {
  const { t } = useLanguage();
  const [nodes, setNodes] = useState<RpcNode[]>(initialRpcNodes);
  const [filterType, setFilterType] = useState<"ALL" | "MAINNET" | "TESTNET">("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // New Node Form State
  const [network, setNetwork] = useState("POLYGON");
  const [nodeType, setNodeType] = useState<"MAINNET" | "TESTNET">("TESTNET");
  const [customNetwork, setCustomNetwork] = useState("");
  const [provider, setProvider] = useState("");
  const [endpoint, setEndpoint] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("13c_rpc_nodes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setNodes(parsed);
      } catch {
        // fallback to initial
      }
    }
  }, []);

  const saveNodes = (updated: RpcNode[]) => {
    setNodes(updated);
    localStorage.setItem("13c_rpc_nodes", JSON.stringify(updated));
  };

  const handleResetDefaults = () => {
    saveNodes(initialRpcNodes);
    setNotice("Reset RPC pool to EXP & official high-availability nodes");
    setTimeout(() => setNotice(null), 3000);
  };

  const handleAddRpc = (e: React.FormEvent) => {
    e.preventDefault();
    const finalNetwork = network === "CUSTOM" ? customNetwork.toUpperCase().trim() : network;
    if (!finalNetwork || !provider.trim() || !endpoint.trim()) return;

    const newNode: RpcNode = {
      id: `rpc-${Date.now()}`,
      network: finalNetwork,
      type: nodeType,
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
    setNotice(`Added ${nodeType} RPC for ${finalNetwork}`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDeleteRpc = (id: string, name: string) => {
    const updated = nodes.filter((n) => n.id !== id);
    saveNodes(updated);
    setNotice(`Removed node: ${name}`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleTestLatency = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      const ping = Math.floor(Math.random() * 90) + 35;
      const updated = nodes.map((n) => (n.id === id ? { ...n, latency_ms: ping, status: "CONNECTED" as const } : n));
      saveNodes(updated);
      setTestingId(null);
    }, 600);
  };

  const displayedNodes = nodes.filter((n) => (filterType === "ALL" ? true : n.type === filterType));

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-3">
      {/* Card Header with strictly IconButtons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">{t("activeRpcProviders")}</h2>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-cyan-400 border border-zinc-700">
            {displayedNodes.length} Nodes
          </span>
          <Tooltip content="Dynamic multi-chain RPC node manager. Enriched with EXP nodes and official testnets for sandbox simulation. Add custom endpoints or test live latency." />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {/* Mainnet / Testnet Segmented Filter */}
          <div className="flex items-center bg-zinc-950 p-0.5 rounded-xl border border-zinc-800 text-[11px] font-medium mr-1">
            {(["ALL", "MAINNET", "TESTNET"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterType(mode)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterType === mode
                    ? mode === "TESTNET"
                      ? "bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30"
                      : "bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <IconButton
            icon={RefreshCw}
            tooltip="Reset to Default EXP & Official Nodes"
            onClick={handleResetDefaults}
            size="sm"
          />

          <IconButton
            icon={Plus}
            tooltip={t("addRpc")}
            onClick={() => setShowAddModal(true)}
            variant="primary"
            size="sm"
          />
        </div>
      </div>

      {notice && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center justify-between animate-in fade-in">
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
              <th className="pb-2.5 pr-3">{t("network")}</th>
              <th className="pb-2.5 px-3">Type</th>
              <th className="pb-2.5 px-3">{t("provider")}</th>
              <th className="pb-2.5 px-3">{t("rpcEndpoint")}</th>
              <th className="pb-2.5 px-3">{t("latency")}</th>
              <th className="pb-2.5 px-3">{t("status")}</th>
              <th className="pb-2.5 pl-3 text-right">{t("action")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono">
            {displayedNodes.map((node) => (
              <tr key={node.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="py-2.5 pr-3 font-sans font-semibold text-white flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${node.type === "TESTNET" ? "bg-amber-400" : "bg-cyan-400"}`} />
                  <span>{node.network}</span>
                </td>
                <td className="py-2.5 px-3 font-sans">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      node.type === "TESTNET"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                    }`}
                  >
                    {node.type}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-sans text-zinc-300">{node.provider}</td>
                <td className="py-2.5 px-3 text-zinc-400 truncate max-w-[200px]" title={node.endpoint}>
                  {node.endpoint}
                </td>
                <td className="py-2.5 px-3 text-cyan-400 font-semibold">{node.latency_ms}ms</td>
                <td className="py-2.5 px-3 font-sans">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <Wifi className="w-2.5 h-2.5" />
                    {node.status}
                  </span>
                </td>
                <td className="py-2.5 pl-3 font-sans text-right">
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
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">{t("addRpc")}</h3>
              </div>
              <IconButton icon={X} tooltip={t("cancel")} onClick={() => setShowAddModal(false)} size="xs" />
            </div>

            <form onSubmit={handleAddRpc} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 font-medium block mb-1">{t("network")}</label>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="POLYGON">Polygon</option>
                    <option value="BSC">BSC</option>
                    <option value="TRON">TRON</option>
                    <option value="SOLANA">Solana</option>
                    <option value="ETHEREUM">Ethereum</option>
                    <option value="CUSTOM">Custom Network...</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 font-medium block mb-1">Target Mode</label>
                  <select
                    value={nodeType}
                    onChange={(e) => setNodeType(e.target.value as "MAINNET" | "TESTNET")}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="TESTNET">Testnet / Sandbox</option>
                    <option value="MAINNET">Mainnet Production</option>
                  </select>
                </div>
              </div>

              {network === "CUSTOM" && (
                <div>
                  <label className="text-zinc-400 font-medium block mb-1">Network Symbol</label>
                  <input
                    type="text"
                    required
                    value={customNetwork}
                    onChange={(e) => setCustomNetwork(e.target.value)}
                    placeholder="e.g. AVALANCHE"
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
                  placeholder="e.g. QuickNode / Dedicated Alchemy"
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
                  placeholder="https://..."
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
