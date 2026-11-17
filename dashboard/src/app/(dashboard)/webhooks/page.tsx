"use client";

import React, { useState, useEffect } from "react";
import { Webhook, Send, CheckCircle2, ShieldCheck, Code, Check, AlertCircle } from "lucide-react";
import { useEnvironment } from "../../../context/EnvironmentContext";
import { WebhookLogsCard } from "../../../components/dashboard/WebhookLogsCard";
import { Tooltip } from "../../../components/ui/Tooltip";
import { Button } from "../../../components/ui/Button";
import { MerchantService } from "../../../services/merchantService";
import { mockWebhookDeliveries } from "../../../mocks/mockMerchant";

export default function WebhooksPage() {
  const { profile, updateProfile } = useEnvironment();
  const [url, setUrl] = useState(profile.webhook_url || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (profile.webhook_url) {
      setUrl(profile.webhook_url);
    }
  }, [profile.webhook_url]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await updateProfile({ webhook_url: url.trim() });
      if (res.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        setSaveError(res.error || "Failed to save webhook URL to database");
      }
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Error saving webhook URL");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestPing = async () => {
    if (!url.trim()) {
      setSaveError("Please enter a valid webhook destination URL first.");
      return;
    }
    setIsPinging(true);
    setPingResult(null);
    setSaveError(null);

    try {
      const res = await MerchantService.testWebhook({
        url: url.trim(),
        event: "INVOICE_PAID",
        order_id: "ORD-TEST-9901",
        payload: samplePayload,
      });

      if (res.data) {
        setPingResult({
          success: res.data.success || res.data.status_code < 300,
          message: `Webhook delivered in ${res.data.duration_ms}ms (HTTP ${res.data.status_code}). Delivery ID: ${res.data.delivery_id}`,
        });
      } else {
        setPingResult({
          success: false,
          message: res.error || "Webhook test dispatch failed to reach target URL",
        });
      }
    } catch (err: unknown) {
      setPingResult({
        success: false,
        message: err instanceof Error ? err.message : "Network error testing webhook",
      });
    } finally {
      setIsPinging(false);
    }
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
            HMAC-SHA256 Signing
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
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              loadingText="Saving..."
              icon={isSaved ? <Check className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            >
              {isSaved ? "Saved" : "Save URL"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleTestPing}
              isLoading={isPinging}
              loadingText="Pinging..."
              icon={<Send className="w-3.5 h-3.5 text-cyan-400" />}
            >
              Test Ping
            </Button>
          </div>
        </form>

        {saveError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {pingResult && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              pingResult.success
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
            }`}
          >
            {pingResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{pingResult.message}</span>
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
