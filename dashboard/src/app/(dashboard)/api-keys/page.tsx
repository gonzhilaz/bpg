"use client";

import React, { useState } from "react";
import { Key, Shield, RefreshCw, Terminal, Check, Copy, AlertTriangle, Lock } from "lucide-react";
import { useEnvironment } from "../../../context/EnvironmentContext";
import { ApiKeyCard } from "../../../components/dashboard/ApiKeyCard";

export default function ApiKeysPage() {
  const { profile, mode } = useEnvironment();
  const [activeTab, setActiveTab] = useState<"curl" | "node">("curl");
  const [copiedCode, setCopiedCode] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenSuccess, setRegenSuccess] = useState(false);

  const curlExample = `curl -X POST https://api.captaingateway.com/api/v1/invoices \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: ${profile.api_key}" \\
  -d '{
    "order_id": "ORD-9901",
    "amount": "25.00",
    "currency": "USD",
    "network": "TRON",
    "fee_payer": "customer"
  }'`;

  const nodeExample = `const axios = require('axios');

const response = await axios.post(
  'https://api.captaingateway.com/api/v1/invoices',
  {
    order_id: 'ORD-9901',
    amount: '25.00',
    currency: 'USD',
    network: 'TRON',
    fee_payer: 'customer'
  },
  {
    headers: {
      'X-API-KEY': '${profile.api_key}',
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

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      setShowRegenModal(false);
      setRegenSuccess(true);
      setTimeout(() => setRegenSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">API Credentials & Security</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Authenticate your backend store and verify HMAC-SHA256 webhook signatures.
          </p>
        </div>

        <button
          onClick={() => setShowRegenModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
          <span>Regenerate Key</span>
        </button>
      </div>

      {regenSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>API Key successfully regenerated! Update your server environment variables.</span>
        </div>
      )}

      {/* Main Credentials Card */}
      <ApiKeyCard apiKey={profile.api_key} secretKey={profile.secret_key} />

      {/* Quick Integration Code Snippets */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Quick Integration</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setActiveTab("curl")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "curl" ? "bg-zinc-800 text-cyan-300 font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveTab("node")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === "node" ? "bg-zinc-800 text-cyan-300 font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Node.js
              </button>
            </div>

            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 font-mono overflow-x-auto leading-relaxed">
          {activeTab === "curl" ? curlExample : nodeExample}
        </pre>
      </div>

      {/* Security Guidance Card */}
      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Zero-Trust Architecture</span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Never expose your API Key or Webhook Secret in client-side code, mobile binaries, or public Git repositories. Always route checkout requests through your server-side backend.
        </p>
      </div>

      {/* Confirmation Modal for Regeneration */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Regenerate API Key?</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Your current API key will be immediately revoked. Any existing store integrations using the old key will fail until updated.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRegenModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-colors disabled:opacity-50"
              >
                {isRegenerating ? "Regenerating..." : "Revoke & Regenerate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
