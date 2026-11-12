"use client";

import React, { useState } from "react";
import { Wallet, ShieldCheck, Check } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import { MerchantProfile } from "../../types/merchant";

interface Props {
  profile: MerchantProfile;
}

export function PayoutSettingsCard({ profile }: Props) {
  const [tronAddr, setTronAddr] = useState(profile.payout_address_tron);
  const [bscAddr, setBscAddr] = useState(profile.payout_address_bsc);
  const [polygonAddr, setPolygonAddr] = useState(profile.payout_address_polygon);
  const [solanaAddr, setSolanaAddr] = useState(profile.payout_address_solana);
  const [autoPayout, setAutoPayout] = useState(profile.auto_payout_enabled);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Payout Wallets</h2>
          <Tooltip content="Destination addresses where funds are automatically forwarded." />
        </div>

        <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
          <input
            type="checkbox"
            checked={autoPayout}
            onChange={(e) => setAutoPayout(e.target.checked)}
            className="rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-0"
          />
          <span>Auto-Payout</span>
        </label>
      </div>

      <form onSubmit={handleSave} className="space-y-3 text-xs">
        <div>
          <label className="block text-zinc-400 mb-1 font-medium">TRON Address (TRC-20)</label>
          <input
            type="text"
            value={tronAddr}
            onChange={(e) => setTronAddr(e.target.value)}
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-3 py-2 text-zinc-200 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-zinc-400 mb-1 font-medium">BSC Address (BEP-20)</label>
            <input
              type="text"
              value={bscAddr}
              onChange={(e) => setBscAddr(e.target.value)}
              className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-3 py-2 text-zinc-200 font-mono focus:outline-none focus:border-cyan-500 truncate"
            />
          </div>
          <div>
            <label className="block text-zinc-400 mb-1 font-medium">Polygon Address</label>
            <input
              type="text"
              value={polygonAddr}
              onChange={(e) => setPolygonAddr(e.target.value)}
              className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-3 py-2 text-zinc-200 font-mono focus:outline-none focus:border-cyan-500 truncate"
            />
          </div>
        </div>

        <div>
          <label className="block text-zinc-400 mb-1 font-medium">Solana Address (SPL)</label>
          <input
            type="text"
            value={solanaAddr}
            onChange={(e) => setSolanaAddr(e.target.value)}
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-3 py-2 text-zinc-200 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-3 rounded-xl font-medium text-xs text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center justify-center gap-1.5"
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
          {saved ? "Saved" : "Save Payout Settings"}
        </button>
      </form>
    </div>
  );
}
