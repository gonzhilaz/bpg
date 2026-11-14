"use client";

import React, { useState } from "react";
import { Terminal, Copy, Check, Code, ExternalLink } from "lucide-react";
import { getEnvUrl } from "../../utils/env";

export function CodeShowcase() {
  const [activeTab, setActiveTab] = useState<"curl" | "go" | "node" | "php">("curl");
  const [copied, setCopied] = useState(false);

  const snippets = {
    curl: `curl -X POST "${getEnvUrl.api()}/api/v1/invoices" \\
  -H "Authorization: Bearer 13c_live_9a8b7c6d5e4f" \\
  -H "Content-Type: application/json" \\
  -d '{
    "order_id": "ORD-9901",
    "amount": "49.99",
    "currency": "USDT",
    "network": "BSC",
    "customer_email": "alice@customer.com",
    "callback_url": "https://myshop.com/api/webhooks/crypto"
  }'`,

    go: `package main

import (
    "fmt"
    "github.com/gonzhilaz/bpg/sdks/go/bpg"
)

func main() {
    client := bpg.NewClient("13c_live_9a8b7c6d5e4f")
    inv, err := client.CreateInvoice(&bpg.InvoiceRequest{
        OrderID:  "ORD-9901",
        Amount:   "49.99",
        Currency: "USDT",
        Network:  "TRON",
    })
    if err != nil {
        panic(err)
    }
    fmt.Printf("Checkout URL: %s\\nDeposit Address: %s\\n", inv.CheckoutURL, inv.DepositAddress)
}`,

    node: `import { BpgClient } from '@13c/gateway-sdk';

const client = new BpgClient({ apiKey: process.env.BPG_API_KEY });

// 1. Create Invoice
const invoice = await client.invoices.create({
  orderId: 'ORD-9901',
  amount: '49.99',
  currency: 'USDT',
  network: 'POLYGON',
});

// 2. Webhook Signature Verification
const isValid = client.webhooks.verifySignature(rawBody, req.headers['x-13c-signature']);`,

    php: `<?php
// Verify HMAC-SHA256 signature in WooCommerce webhook
$secretKey = getenv('BPG_WEBHOOK_SECRET');
$payload = file_get_contents('php://input');
$signatureHeader = $_SERVER['HTTP_X_13C_SIGNATURE'];

$expectedSignature = hash_hmac('sha256', $payload, $secretKey);

if (hash_equals($expectedSignature, $signatureHeader)) {
    $event = json_decode($payload, true);
    if ($event['status'] === 'PAID') {
        mark_order_complete($event['order_id']);
    }
    http_response_code(200);
}`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developers" className="py-20 border-t border-zinc-800/80 bg-zinc-950/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
            <Code className="w-3.5 h-3.5" />
            <span>Developer-First Integration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Integrate in Under 5 Minutes
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Lightweight REST endpoints and native SDKs. Zero dependencies, pure cryptographic HMAC
            verification.
          </p>
        </div>

        {/* Code Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Tabs Header */}
          <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("curl")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                  activeTab === "curl"
                    ? "bg-cyan-500 text-zinc-950 font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                cURL
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("go")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                  activeTab === "go"
                    ? "bg-cyan-500 text-zinc-950 font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Go
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("node")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                  activeTab === "node"
                    ? "bg-cyan-500 text-zinc-950 font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Node.js
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("php")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                  activeTab === "php"
                    ? "bg-cyan-500 text-zinc-950 font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                PHP / WooCommerce
              </button>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={getEnvUrl.swagger()}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
              >
                <span>Full OpenAPI Specs</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Code"}</span>
              </button>
            </div>
          </div>

          {/* Snippet Body */}
          <pre className="p-5 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed bg-[#0A0D13]">
            {snippets[activeTab]}
          </pre>
        </div>
      </div>
    </section>
  );
}

