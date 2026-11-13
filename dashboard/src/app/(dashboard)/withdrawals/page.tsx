"use client";

import React, { useState } from "react";
import {
  WalletCards,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  AlertCircle,
  X,
} from "lucide-react";
import { WithdrawalItem, Network } from "../../../types/merchant";
import { Tooltip } from "../../../components/ui/Tooltip";
import { IconButton } from "../../../components/ui/IconButton";
import { useEnvironment } from "../../../context/EnvironmentContext";

// Initial mock data adhering to Pillar 1
const initialWithdrawals: WithdrawalItem[] = [
  {
    id: "wd-m-101",
    amount: "150.00",
    currency: "USDT",
    network: "TRON",
    target_address: "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa",
    status: "PENDING",
    requested_at: "2026-11-13T10:15:00Z",
  },
  {
    id: "wd-m-100",
    amount: "280.00",
    currency: "USDT",
    network: "BSC",
    target_address: "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
    status: "COMPLETED",
    tx_hash: "0xescrow_payout_bsc_784921901a8b",
    requested_at: "2026-11-10T14:30:00Z",
  },
];

export default function MerchantWithdrawalsPage() {
  const { profile } = useEnvironment();
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>(initialWithdrawals);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [availableBalance, setAvailableBalance] = useState("850.00");
  const [lockedBalance, setLockedBalance] = useState("150.00");

  // Form State
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState<Network>("TRON");
  const [targetAddress, setTargetAddress] = useState(profile.payout_address_tron || "");
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleNetworkChange = (net: Network) => {
    setNetwork(net);
    if (net === "TRON") setTargetAddress(profile.payout_address_tron || "");
    else if (net === "BSC") setTargetAddress(profile.payout_address_bsc || "");
    else if (net === "POLYGON") setTargetAddress(profile.payout_address_polygon || "");
    else if (net === "SOLANA") setTargetAddress(profile.payout_address_solana || "");
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const val = parseFloat(amount);
    if (isNaN(val) || val < 50) {
      setFormError("Minimum withdrawal is $50.00 USD");
      return;
    }

    if (val > parseFloat(availableBalance)) {
      setFormError(`Insufficient balance. Available: $${availableBalance}`);
      return;
    }

    if (!targetAddress.trim()) {
      setFormError("Destination wallet address is required");
      return;
    }

    const newReq: WithdrawalItem = {
      id: `wd-m-${Date.now().toString().slice(-4)}`,
      amount: val.toFixed(2),
      currency: "USDT",
      network,
      target_address: targetAddress.trim(),
      status: "PENDING",
      requested_at: new Date().toISOString(),
    };

    setWithdrawals([newReq, ...withdrawals]);
    setAvailableBalance((parseFloat(availableBalance) - val).toFixed(2));
    setLockedBalance((parseFloat(lockedBalance) + val).toFixed(2));
    setShowRequestModal(false);
    setAmount("");
    setNotice(`Withdrawal request of $${val.toFixed(2)} USDT submitted to developer approval queue.`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Escrow & Withdrawals</span>
            <Tooltip content="Withdraw accumulated payment revenue from platform escrow vault to your external cold wallet." />
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Settlement funds accumulate in your internal escrow ledger. Request withdrawals or receive batch payouts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowRequestModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Request Payout</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center justify-between animate-in fade-in">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-zinc-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Available Balance</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">${availableBalance}</div>
          <span className="text-[11px] text-zinc-500">Ready for instant withdrawal</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">In Escrow / Pending</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">${lockedBalance}</div>
          <span className="text-[11px] text-zinc-500">Locked in processing requests</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Min Payout Threshold</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">$50.00</div>
          <span className="text-[11px] text-zinc-500">Per withdrawal batch</span>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <WalletCards className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Withdrawal History</h2>
          </div>
          <span className="text-xs text-zinc-500 font-mono">{withdrawals.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 px-4">Network</th>
                <th className="pb-3 px-4">Destination Address</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Requested Date</th>
                <th className="pb-3 pl-4 text-right">Receipt / Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {withdrawals.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 pr-4 text-cyan-400 font-bold">
                    ${item.amount} <span className="text-[10px] text-zinc-400">{item.currency}</span>
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                      {item.network}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-400 truncate max-w-[200px]" title={item.target_address}>
                    {item.target_address}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        item.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : item.status === "PENDING"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {item.status === "PENDING" && <Clock className="w-2.5 h-2.5" />}
                      {item.status === "COMPLETED" && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {item.status === "REJECTED" && <XCircle className="w-2.5 h-2.5" />}
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-400 text-[11px]">
                    {new Date(item.requested_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 pl-4 font-sans text-right">
                    {item.tx_hash ? (
                      <IconButton
                        icon={ExternalLink}
                        tooltip="View On-Chain Receipt"
                        onClick={() => alert(`Broadcast Hash: ${item.tx_hash}`)}
                        size="xs"
                      />
                    ) : (
                      <span className="text-zinc-600 text-[11px]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Request Escrow Withdrawal</h3>
              </div>
              <IconButton icon={X} tooltip="Close" onClick={() => setShowRequestModal(false)} size="sm" />
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRequestSubmit} className="space-y-3.5">
              <div>
                <label className="text-zinc-400 font-medium block mb-1">
                  Amount to Withdraw (USD) <span className="text-zinc-500">(Min: $50.00)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="50"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="50.00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-7 pr-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                  <span>Available: ${availableBalance}</span>
                  <button
                    type="button"
                    onClick={() => setAmount(availableBalance)}
                    className="text-cyan-400 hover:underline"
                  >
                    Withdraw All
                  </button>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">Payout Network</label>
                <select
                  value={network}
                  onChange={(e) => handleNetworkChange(e.target.value as Network)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="TRON">TRON (USDT TRC-20)</option>
                  <option value="BSC">BSC (USDT BEP-20)</option>
                  <option value="POLYGON">Polygon (USDT / USDC)</option>
                  <option value="SOLANA">Solana (USDT / USDC)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">Destination Wallet Address</label>
                <input
                  type="text"
                  required
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  placeholder="0x... or T..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

