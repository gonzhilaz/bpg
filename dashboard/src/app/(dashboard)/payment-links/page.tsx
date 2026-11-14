"use client";

import React, { useState, useEffect } from "react";
import {
  Link2,
  Plus,
  Copy,
  Check,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Globe2,
  CheckCircle2,
  Power,
} from "lucide-react";
import { PaymentLinkItem, Network } from "../../../types/merchant";
import { mockPaymentLinks } from "../../../mocks/mockMerchant";
import { Tooltip } from "../../../components/ui/Tooltip";
import { CreatePaymentLinkModal } from "../../../components/dashboard/CreatePaymentLinkModal";
import { getEnvUrl } from "../../../utils/env";

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<PaymentLinkItem[]>(mockPaymentLinks);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const token = localStorage.getItem("13c_token");
        if (!token) return;
        const res = await fetch(`${getEnvUrl.api()}/api/v1/payment-links`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => null);
        if (json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setLinks(json.data);
        }
      } catch {
        // Fallback to mock data if offline
      }
    };
    fetchLinks();
  }, []);

  const copyUrl = (slug: string) => {
    const url = `${getEnvUrl.api()}/pay/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleToggle = async (id: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, is_active: !l.is_active } : l))
    );

    try {
      const token = localStorage.getItem("13c_token");
      if (token) {
        await fetch(`${getEnvUrl.api()}/api/v1/payment-links/${id}/toggle`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Optimistic update retained
    }
  };

  const handleCreateSubmit = async (data: {
    title: string;
    description: string;
    amount: string;
    isOpenAmount: boolean;
    network: Network;
  }) => {
    setIsCreating(true);

    const slug = `pl_${Math.random().toString(36).substring(2, 8)}`;
    const newLink: PaymentLinkItem = {
      id: `pl-${Date.now()}`,
      slug,
      title: data.title,
      description: data.description || undefined,
      amount: data.isOpenAmount || !data.amount ? undefined : parseFloat(data.amount).toFixed(2),
      currency: "USD",
      pay_network: data.network,
      is_active: true,
      total_collected: "0.00",
      payment_count: 0,
      created_at: new Date().toISOString().split("T")[0],
    };

    try {
      const token = localStorage.getItem("13c_token");
      if (token) {
        const res = await fetch(`${getEnvUrl.api()}/api/v1/payment-links`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: data.title,
            description: data.description || undefined,
            amount: data.isOpenAmount || !data.amount ? undefined : parseFloat(data.amount),
            currency: "USD",
            pay_network: data.network,
          }),
        });
        const json = await res.json().catch(() => null);
        if (json?.success && json.data) {
          setLinks((prev) => [json.data, ...prev]);
        } else {
          setLinks((prev) => [newLink, ...prev]);
        }
      } else {
        setLinks((prev) => [newLink, ...prev]);
      }
    } catch {
      setLinks((prev) => [newLink, ...prev]);
    } finally {
      setIsCreating(false);
      setShowCreateModal(false);
      setNotice(`Payment link "${data.title}" created!`);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const totalCollectedUSD = links.reduce(
    (acc, l) => acc + parseFloat(l.total_collected.replace(/,/g, "") || "0"),
    0
  );
  const totalPayments = links.reduce((acc, l) => acc + l.payment_count, 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Link2 className="w-5 h-5 text-cyan-400" />
            <span>No-Code Payment Links</span>
            <Tooltip content="Shareable payment URLs for e-commerce, messaging apps, and custom invoices. Direct settlement to your wallet." />
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Create instant payment links with fixed prices or open donation amounts without writing code.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-zinc-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-lg shadow-cyan-500/10 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Payment Link</span>
        </button>
      </div>

      {/* Notice Toast */}
      {notice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Metrik Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            ${totalCollectedUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-500">Gross revenue via payment links</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total Payments</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalPayments}</div>
          <div className="text-[11px] text-zinc-500">Successful customer checkouts</div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Active Links</span>
            <Globe2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {links.filter((l) => l.is_active).length}{" "}
            <span className="text-xs text-zinc-500 font-sans font-normal">/ {links.length}</span>
          </div>
          <div className="text-[11px] text-zinc-500">Publicly accessible links</div>
        </div>
      </div>

      {/* Table of Links */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Configured Payment Links</h2>
          <span className="text-xs text-zinc-500 font-mono">
            Direct-to-Wallet Settlement
          </span>
        </div>

        {links.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs space-y-2">
            <Link2 className="w-8 h-8 mx-auto text-zinc-600" />
            <p>No payment links created yet. Click New Payment Link to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-sans font-medium text-[11px]">
                  <th className="pb-3 pr-4">Title / Slug</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4">Network</th>
                  <th className="pb-3 px-4">Revenue</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div className="font-sans font-semibold text-zinc-200">
                        {link.title}
                      </div>
                      <div className="text-zinc-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                        <span className="text-cyan-400 font-mono">/pay/{link.slug}</span>
                        <button
                          type="button"
                          onClick={() => copyUrl(link.slug)}
                          className="hover:text-white p-0.5"
                          title="Copy Link URL"
                        >
                          {copiedSlug === link.slug ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-zinc-200">
                      {link.amount ? (
                        `$${parseFloat(link.amount).toFixed(2)}`
                      ) : (
                        <span className="text-zinc-500 italic font-sans text-[11px]">
                          Open (Customer Choice)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-[10px] font-sans font-semibold">
                        {link.pay_network}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-300">
                      <div>${parseFloat(link.total_collected || "0").toFixed(2)}</div>
                      <div className="text-[10px] text-zinc-500 font-sans">
                        {link.payment_count} payments
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          link.is_active
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : "text-zinc-500 bg-zinc-800 border-zinc-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            link.is_active ? "bg-emerald-400" : "bg-zinc-500"
                          }`}
                        />
                        {link.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>

                    <td className="py-3.5 pl-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => copyUrl(link.slug)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium border border-zinc-700/80 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedSlug === link.slug ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 text-cyan-400" />
                          )}
                          <span>{copiedSlug === link.slug ? "Copied" : "Copy"}</span>
                        </button>

                        <a
                          href={`${getEnvUrl.api()}/pay/${link.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700/80 transition-colors"
                          title="Open Checkout Preview"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleToggle(link.id)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                            link.is_active
                              ? "border-zinc-700 text-zinc-400 hover:text-rose-400 hover:border-rose-500/40"
                              : "border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                          }`}
                          title={link.is_active ? "Deactivate Link" : "Activate Link"}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modular Create Modal */}
      <CreatePaymentLinkModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        isCreating={isCreating}
      />
    </div>
  );
}
