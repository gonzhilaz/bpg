"use client";

import React, { useState } from "react";
import { Webhook, Radio, Send, CheckCircle2, ShieldCheck, Code, Check } from "lucide-react";
import { useEnvironment } from "../../../context/EnvironmentContext";
import { WebhookLogsCard } from "../../../components/dashboard/WebhookLogsCard";
import { Tooltip } from "../../../components/ui/Tooltip";
import { mockWebhookDeliveries } from "../../../mocks/mockMerchant";

export default function WebhooksPage() {
  const { profile, webhookLogs } = useEnvironment();
  const [url, setUrl] = useState(profile.webhook_url || "https://example-store.com/api/webhooks/crypto");
  const [isPinging, setIsPinging] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setPingSuccess(true);
      setTimeout(() => setPingSuccess(false), 3000);
    }, 1000);
  };

  const samplePayload = {
    event: "INVOICE_PAID",
    invoice_id: "inv_9a8b7c6d",
    order_id: "ORD-9901",
    amount: "25.00",
    currency: "USDT",
    network: "TRON",
    deposit_address: "TXyz999...P4qR",
    tx_hash: "3a9f02...e4c1",
    signature: "sha256=4f3c7...98a",
    timestamp: "2026-11-13T09:00:00Z",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Webhook Delivery Logs</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Real-time HTTP push notifications dispatched upon payment detection and on-chain confirmation.
        </p>
      </div>

      {/* Webhook Endpoint Config Card */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Webhook className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Webhook Endpoint</h2>
            <Tooltip content="Destination HTTP URL receiving POST notifications when payment events occur" />
          </div>

          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            Signature Verification: Enabled
          </span>
        </div>

        <form onSubmit={handleSave} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourdomain.com/api/crypto-webhook"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-cyan-500 text-zinc-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
            >
              {isSaved ? "Saved!" : "Save URL"}
            </button>

            <button
              type="button"
              onClick={handleTestPing}
              disabled={isPinging}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isPinging ? "Pinging..." : "Test Ping"}</span>
            </button>
          </div>
        </form>

        {pingSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Test ping delivered successfully: HTTP 200 OK returned by endpoint.</span>
          </div>
        )}
      </div>

      {/* Webhook Delivery Table */}
      <WebhookLogsCard logs={mockWebhookDeliveries} />

      {/* JSON Payload Schema Example */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Sample Webhook Payload</h3>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">application/json</span>
        </div>

        <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 font-mono overflow-x-auto">
          {JSON.stringify(samplePayload, null, 2)}
        </pre>
      </div>
    </div>
  );
}

