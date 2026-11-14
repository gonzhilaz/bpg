"use client";

import React, { useState } from "react";
import { Wallet, ShieldCheck, Check, UserCheck, Building2, Flame, Percent } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import { MerchantProfile, NetworkGasRate } from "../../types/merchant";
import { mockNetworkGasRates } from "../../mocks/mockMerchant";

interface Props {
  profile: MerchantProfile;
  gasRates?: NetworkGasRate[];
}

export function PayoutSettingsCard({ profile, gasRates = mockNetworkGasRates }: Props) {
  const [tronAddr, setTronAddr] = useState(profile.payout_address_tron);
  const [bscAddr, setBscAddr] = useState(profile.payout_address_bsc);
  const [polygonAddr, setPolygonAddr] = useState(profile.payout_address_polygon);
  const [solanaAddr, setSolanaAddr] = useState(profile.payout_address_solana);
  const [autoPayout, setAutoPayout] = useState(profile.auto_payout_enabled);
  const [feePayer, setFeePayer] = useState<"customer" | "merchant">(profile.fee_payer || "customer");
  const [tolerance, setTolerance] = useState(
    profile.underpaid_tolerance !== undefined ? profile.underpaid_tolerance.toFixed(2) : "0.00"
  );
  const [saved, setSaved] = useState(false);

  const getRate = (net: string) => gasRates.find((r) => r.network === net);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tronRate = getRate("TRON");
  const bscRate = getRate("BSC");
  const polyRate = getRate("POLYGON");
  const solRate = getRate("SOLANA");

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Payout Wallets</h2>
          <Tooltip content="Cold wallet addresses where swept customer payments are sent." />
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

      {/* Fee Payer Inline Compact Control */}
      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium">Fee Payer</span>
          <Tooltip content="Choose who pays blockchain sweep gas fees: Customer adds fee to checkout, Merchant deducts from payout." />
        </div>

        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setFeePayer("customer")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              feePayer === "customer"
                ? "bg-cyan-500 text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => setFeePayer("merchant")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              feePayer === "merchant"
                ? "bg-cyan-500 text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Merchant</span>
          </button>
        </div>
      </div>

      {/* Underpaid Margin Control */}
      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-zinc-300">
          <Percent className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium">Underpaid Margin</span>
          <Tooltip content="Allowable underpayment threshold (0.00% - 100.00%). Invoices within this margin are automatically marked as PAID. Default is 0.00% for strict exact match." />
        </div>

        <div className="relative w-28">
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={tolerance}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (isNaN(val)) setTolerance(e.target.value);
              else if (val < 0) setTolerance("0.00");
              else if (val > 100) setTolerance("100.00");
              else setTolerance(e.target.value);
            }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pr-7 pl-2.5 py-1 text-right text-xs text-white font-mono focus:outline-none focus:border-cyan-500/50"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-[11px]">%</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3 text-xs">
        {/* TRON */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-zinc-400 font-medium">TRON (TRC-20)</label>
            {tronRate && (
              <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>TRX: ${tronRate.coin_price_usd}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-emerald-400">Gas: ~${tronRate.est_sweep_fee_usd}</span>
                <Tooltip content={`Energy: ${tronRate.gas_price_metric}. Network status: ${tronRate.status}`} />
              </span>
            )}
          </div>
          <input
            type="text"
            value={tronAddr}
            onChange={(e) => setTronAddr(e.target.value)}
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-3 py-2 text-zinc-200 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* BSC & Polygon */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-zinc-400 font-medium">BSC (BEP-20)</label>
              {bscRate && (
                <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800/80 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="text-emerald-400">~${bscRate.est_sweep_fee_usd}</span>
                  <Tooltip content={`BNB: $${bscRate.coin_price_usd} | Gas: ${bscRate.gas_price_metric}`} />
                </span>
              )}
            </div>
            <input
              type="text"
              value={bscAddr}
              onChange={(e) => setBscAddr(e.target.value)}
              className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-3 py-2 text-zinc-200 font-mono focus:outline-none focus:border-cyan-500 truncate"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-zinc-400 font-medium">Polygon</label>
              {polyRate && (
                <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800/80 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="text-emerald-400">~${polyRate.est_sweep_fee_usd}</span>
                  <Tooltip content={`POL: $${polyRate.coin_price_usd} | Gas: ${polyRate.gas_price_metric}`} />
                </span>
              )}
            </div>
            <input
              type="text"
              value={polygonAddr}
              onChange={(e) => setPolygonAddr(e.target.value)}
              className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-3 py-2 text-zinc-200 font-mono focus:outline-none focus:border-cyan-500 truncate"
            />
          </div>
        </div>

        {/* Solana */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-zinc-400 font-medium">Solana (SPL)</label>
            {solRate && (
              <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>SOL: ${solRate.coin_price_usd}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-emerald-400">Gas: ~${solRate.est_sweep_fee_usd}</span>
                <Tooltip content={`Lamports: ${solRate.gas_price_metric}. Network status: ${solRate.status}`} />
              </span>
            )}
          </div>
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
