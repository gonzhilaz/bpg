"use client";

import React, { useState } from "react";
import { Link2, X } from "lucide-react";
import { Network } from "../../types/merchant";
import { IconButton } from "../ui/IconButton";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (linkData: {
    title: string;
    description: string;
    amount: string;
    isOpenAmount: boolean;
    network: Network;
  }) => Promise<void>;
  isCreating: boolean;
}

export function CreatePaymentLinkModal({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isOpenAmount, setIsOpenAmount] = useState(false);
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState<Network>("TRON");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      amount,
      isOpenAmount,
      network,
    });

    setTitle("");
    setDescription("");
    setAmount("");
    setIsOpenAmount(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Create Payment Link</h3>
          </div>
          <IconButton icon={X} onClick={onClose} tooltip="Close" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-400 font-medium">Product / Link Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. VIP Subscription or Advisory Call"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 font-medium">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Brief explanation shown on payment page..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-zinc-400 font-medium">Amount</label>
              <label className="flex items-center gap-1.5 text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOpenAmount}
                  onChange={(e) => setIsOpenAmount(e.target.checked)}
                  className="rounded bg-zinc-950 border-zinc-800 text-cyan-500 focus:ring-0"
                />
                <span>Customer decides amount (Donation)</span>
              </label>
            </div>

            {!isOpenAmount && (
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-500 font-mono">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.50"
                  required={!isOpenAmount}
                  placeholder="25.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-7 pr-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 font-medium">Settlement Blockchain</label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value as Network)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="TRON">TRON (USDT TRC-20)</option>
              <option value="BSC">BNB Smart Chain (USDT BEP-20)</option>
              <option value="POLYGON">Polygon (USDT)</option>
              <option value="SOLANA">Solana (USDT SPL)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {isCreating ? "Creating..." : "Create Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
