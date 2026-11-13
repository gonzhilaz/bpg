"use client";

import React from "react";
import { X, Building2, Key, Wallet, Webhook, Activity, Layers } from "lucide-react";
import { AdminMerchant } from "../../types/admin";
import { Tooltip } from "../ui/Tooltip";
import { IconButton } from "../ui/IconButton";

interface Props {
  merchant: AdminMerchant;
  onClose: () => void;
}

export function MerchantDetailModal({ merchant, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{merchant.name}</h3>
              <div className="text-[10px] text-zinc-400 font-mono">ID: {merchant.id}</div>
            </div>
          </div>
          <IconButton icon={X} tooltip="Close" onClick={onClose} size="sm" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 font-mono">
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] text-zinc-500 font-sans uppercase">Total Volume</span>
            <div className="text-base font-bold text-emerald-400">{merchant.volume_usd}</div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1">
            <span className="text-[10px] text-zinc-500 font-sans uppercase">Processed Orders</span>
            <div className="text-base font-bold text-white">{merchant.invoices_count} orders</div>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-2.5 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/70">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              API Key Prefix
            </span>
            <span className="font-mono text-zinc-200">{merchant.api_key_prefix}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Account Status
            </span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                merchant.status === "ACTIVE"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-rose-500/15 text-rose-400"
              }`}
            >
              {merchant.status}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Auto Payout
            </span>
            <span className="text-zinc-200">{merchant.auto_payout ? "Enabled (Instant)" : "Manual Sweeps"}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Webhook className="w-3.5 h-3.5 text-indigo-400" />
              Callback URL
            </span>
            <span className="text-zinc-400 font-mono truncate max-w-[200px]" title={merchant.webhook_url || "None"}>
              {merchant.webhook_url || "Not configured"}
            </span>
          </div>
        </div>

        {/* Destination Wallets */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
            <span>Configured Cold Wallets</span>
          </div>
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 font-mono text-[11px] space-y-1 text-zinc-400">
            <div>TRON: {merchant.payout_address_tron || "TDq9...default_cold"}</div>
            <div>BSC: {merchant.payout_address_bsc || "0x9f2...default_cold"}</div>
            <div>Polygon: {merchant.payout_address_polygon || "0x9f2...default_cold"}</div>
            <div>Solana: {merchant.payout_address_solana || "4k3D...default_cold"}</div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
