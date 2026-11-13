"use client";

import React, { useState } from "react";
import { X, Building2, Save } from "lucide-react";
import { AdminMerchant } from "../../types/admin";
import { IconButton } from "../ui/IconButton";

interface Props {
  merchant: AdminMerchant;
  onSave: (updated: AdminMerchant) => void;
  onClose: () => void;
}

export function MerchantEditModal({ merchant, onSave, onClose }: Props) {
  const [name, setName] = useState(merchant.name);
  const [status, setStatus] = useState(merchant.status);
  const [autoPayout, setAutoPayout] = useState(merchant.auto_payout);
  const [feePayer, setFeePayer] = useState(merchant.fee_payer || "customer");
  const [webhookUrl, setWebhookUrl] = useState(merchant.webhook_url || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...merchant,
      name: name.trim(),
      status,
      auto_payout: autoPayout,
      fee_payer: feePayer as "customer" | "merchant",
      webhook_url: webhookUrl.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Edit Merchant Profile</h3>
          </div>
          <IconButton icon={X} tooltip="Close" onClick={onClose} size="sm" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-zinc-400 font-medium block mb-1">Business Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "ACTIVE" | "SUSPENDED")}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Fee Payer</label>
              <select
                value={feePayer}
                onChange={(e) => setFeePayer(e.target.value as "customer" | "merchant")}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="customer">Customer Adds Gas</option>
                <option value="merchant">Merchant Deducted</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-zinc-400 font-medium block mb-1">Webhook Callback URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://merchant.com/api/crypto-webhook"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={autoPayout}
                onChange={(e) => setAutoPayout(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-800 text-cyan-500"
              />
              <span>Enable Automated Cold Wallet Sweeps</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
