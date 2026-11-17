"use client";

import React, { useState } from "react";
import { Key, Shield, RefreshCw, Terminal, Check, Copy, AlertTriangle, Lock, AlertCircle } from "lucide-react";
import { useEnvironment } from "../../../context/EnvironmentContext";
import { ApiKeyCard } from "../../../components/dashboard/ApiKeyCard";
import { IconButton } from "../../../components/ui/IconButton";
import { Tooltip } from "../../../components/ui/Tooltip";
import { Button } from "../../../components/ui/Button";
import { MerchantService } from "../../../services/merchantService";

export default function ApiKeysPage() {
  const { profile, reload } = useEnvironment();
  const [activeTab, setActiveTab] = useState<"curl" | "node">("curl");
  const [copiedCode, setCopiedCode] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenSuccess, setRegenSuccess] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  const [newCredentials, setNewCredentials] = useState<{
    key: string;
    secret: string;
  } | null>(null);

  const curlExample = `curl -X POST https://api.13cgateway.com/api/v1/invoices \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: ${profile.api_key || "YOUR_API_KEY"}" \\
  -d '{
    "order_id": "ORD-9901",
    "amount": "25.00",
    "currency": "USD",
    "network": "TRON",
    "fee_payer": "customer"
  }'`;

  const nodeExample = `const axios = require('axios');

const response = await axios.post(
  'https://api.13cgateway.com/api/v1/invoices',
  {
    order_id: 'ORD-9901',
    amount: '25.00',
    currency: 'USD',
    network: 'TRON',
    fee_payer: 'customer'
  },
  {
    headers: {
      'X-API-KEY': '${profile.api_key || "YOUR_API_KEY"}',
      'Content-Type': 'application/json'
    }
  }
);
console.log('Payment URL:', response.data.data.checkout_url);`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeTab === "curl" ? curlExample : nodeExample);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setRegenError(null);
    try {
      const res = await MerchantService.regenerateApiKey();
      if (res.data) {
        setNewCredentials({
          key: res.data.raw_api_key,
          secret: res.data.raw_secret_key,
        });
        setRegenSuccess(true);
        setShowRegenModal(false);
        await reload();
      } else {
        setRegenError(res.error || "Failed to rotate API Key in database");
      }
    } catch (err: unknown) {
      setRegenError(err instanceof Error ? err.message : "Error rotating credentials");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-cyan-400" />
            <span>API Credentials</span>
            <Tooltip content="Zero-Trust Architecture: Never expose your API Key or Secret in client-side code, mobile binaries, or public Git repos. Always route checkout requests through server-side." />
          </h1>
          <p className="text-xs text-zinc-400">
            Authenticate your backend store and verify HMAC-SHA256 webhook signatures.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRegenModal(true)}
          icon={<RefreshCw className="w-3.5 h-3.5 text-amber-400" />}
        >
          Rotate Key
        </Button>
      </div>

      {regenSuccess && newCredentials && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <Shield className="w-4 h-4" />
            <span>API Key successfully rotated in database! (Reveal Once Protocol)</span>
          </div>
          <p className="text-[11px] text-zinc-300">
            Save these production credentials immediately. The raw key is hashed in the database and will not be displayed again.
          </p>
          <div className="p-3 bg-zinc-950 rounded-lg font-mono text-[11px] text-zinc-200 select-all break-all space-y-1">
            <div><strong>New API Key:</strong> {newCredentials.key}</div>
            <div><strong>Signing Secret:</strong> {newCredentials.secret}</div>
          </div>
        </div>
      )}

      {/* Main Credentials Card */}
      <ApiKeyCard
        apiKey={newCredentials ? newCredentials.key : profile.api_key}
        secretKey={newCredentials ? newCredentials.secret : profile.secret_key}
      />

      {/* Quick Integration Code Snippets */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Quick Integration</h2>
            <Tooltip content="Production code snippet to create invoices from your backend." />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-0.5 text-xs font-medium">
              <button
                onClick={() => setActiveTab("curl")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === "curl" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveTab("node")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === "node" ? "bg-zinc-800 text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Node.js
              </button>
            </div>

            <IconButton
              icon={copiedCode ? Check : Copy}
              tooltip={copiedCode ? "Copied" : "Copy Code"}
              onClick={handleCopyCode}
            />
          </div>
        </div>

        <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 font-mono overflow-x-auto leading-relaxed">
          {activeTab === "curl" ? curlExample : nodeExample}
        </pre>
      </div>

      {/* Confirmation Modal for Regeneration */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Rotate API Key?</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Your current API key will be immediately revoked in the database. Any existing store integrations using the old key will fail until updated with the new key.
              </p>
            </div>

            {regenError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regenError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRegenModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                Cancel
              </button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleRegenerate}
                isLoading={isRegenerating}
                loadingText="Rotating..."
              >
                Revoke & Rotate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
