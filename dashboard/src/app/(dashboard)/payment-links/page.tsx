"use client";

import React, { useState } from "react";
import {
  Link2,
  Plus,
  Copy,
  Check,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Globe2,
  X,
  CheckCircle2,
  Power,
} from "lucide-react";
import { PaymentLinkItem, Network } from "../../../types/merchant";
import { mockPaymentLinks } from "../../../mocks/mockMerchant";
import { Tooltip } from "../../../components/ui/Tooltip";
import { IconButton } from "../../../components/ui/IconButton";
import { getEnvUrl } from "../../../utils/env";

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<PaymentLinkItem[]>(mockPaymentLinks);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isOpenAmount, setIsOpenAmount] = useState(false);
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState<Network>("TRON");
  const [notice, setNotice] = useState<string | null>(null);

  const copyUrl = (slug: string) => {
    const url = `${getEnvUrl.api()}/pay/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleToggle = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, is_active: !l.is_active } : l))
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const slug = `pl_${Math.random().toString(36).substring(2, 8)}`;
    const newLink: PaymentLinkItem = {
      id: `pl-${Date.now()}`,
      slug,
      title: title.trim(),
      description: description.trim() || undefined,
      amount: isOpenAmount || !amount ? undefined : parseFloat(amount).toFixed(2),
      currency: "USD",
      pay_network: network,
      is_active: true,
      total_collected: "0.00",
      payment_count: 0,
      created_at: new Date().toISOString().split("T")[0],
    };

    setLinks([newLink, ...links]);
    setShowCreateModal(false);
    setTitle("");
    setDescription("");
    setAmount("");
    setIsOpenAmount(false);
    setNotice(`Payment link "${newLink.title}" created!`);
    setTimeout(() => setNotice(null), 3000);
  };

  const totalCollectedUSD = links.reduce(
    (acc, l) => acc + parseFloat(l.total_collected.replace(/,/g, "") || "0"),
    0
  );
  const totalPayments = links.reduce((acc, l) => acc + l.payment_count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Link2 className="w-5 h-5 text-cyan-400" />
            Payment Links
          </h1>
          <p className="text-xs text-zinc-400">
            Create no-code shareable payment URLs for social commerce, invoices, and donations.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold transition-all shadow-lg shadow-cyan-950/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Link</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            ${totalCollectedUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-500">Collected across all active links</div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Total Payments</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">{totalPayments}</div>
          <div className="text-[11px] text-zinc-500">Completed customer settlements</div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
            <span>Active Links</span>
            <Globe2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {links.filter((l) => l.is_active).length} / {links.length}
          </div>
          <div className="text-[11px] text-zinc-500">Public endpoints currently live</div>
        </div>
      </div>

      {/* Links List */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-zinc-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Active Links Catalog</h2>
          </div>
          <Tooltip content="Shareable payment URLs that generate unique on-chain invoices on demand." />
        </div>

        {links.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Link2 className="w-8 h-8 text-zinc-600 mx-auto" />
            <div className="text-sm font-semibold text-zinc-300">No payment links created</div>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Create your first no-code payment link to start accepting crypto without API integration.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Link</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/60 text-zinc-400 font-semibold border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Title & Description</th>
                  <th className="py-3 px-4">Shareable URL</th>
                  <th className="py-3 px-4">Network</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Collected</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{link.title}</div>
                      {link.description && (
                        <div className="text-[11px] text-zinc-400 max-w-xs truncate">
                          {link.description}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 truncate max-w-[180px]">
                          /pay/{link.slug}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyUrl(link.slug)}
                          className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        >
                          {copiedSlug === link.slug ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-300">
                        {link.pay_network}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      {link.amount ? (
                        <span className="text-white">${link.amount}</span>
                      ) : (
                        <span className="text-amber-400 text-[11px]">Open Amount</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-emerald-400">${link.total_collected}</div>
                      <div className="text-[10px] text-zinc-500">{link.payment_count} orders</div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          link.is_active
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                        }`}
                      >
                        {link.is_active ? "LIVE" : "PAUSED"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggle(link.id)}
                        className={`p-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          link.is_active
                            ? "border-zinc-700 text-zinc-400 hover:text-rose-400 hover:border-rose-500/40"
                            : "border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Create Payment Link</h3>
              </div>
              <IconButton icon={X} onClick={() => setShowCreateModal(false)} tooltip="Close" />
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
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
                  placeholder="Tell customers what they are purchasing..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-400 font-medium">Price (USD)</label>
                  <label className="flex items-center gap-1.5 text-[11px] text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOpenAmount}
                      onChange={(e) => setIsOpenAmount(e.target.checked)}
                      className="rounded bg-zinc-800 border-zinc-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Open / Custom Amount</span>
                  </label>
                </div>
                {!isOpenAmount && (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required={!isOpenAmount}
                      placeholder="49.99"
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
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold"
                >
                  Create Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
