"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, RefreshCw, CheckCircle2, ExternalLink, Zap } from "lucide-react";
import { Network } from "../../types/invoice";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function SandboxPage() {
  const [orderId, setOrderId] = useState("ORD-98210");
  const [amount, setAmount] = useState("20.00");
  const [currency] = useState("USD");
  const [payCurrency, setPayCurrency] = useState("USDT");
  const [network, setNetwork] = useState<Network>("TRON");
  const [feePayer, setFeePayer] = useState<"customer" | "merchant">("customer");
  const [loading, setLoading] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<{ id: string; deposit_address: string; pay_amount: string } | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSimulationResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": "cap_demo_api_key_12345678",
        },
        body: JSON.stringify({
          order_id: orderId,
          amount: parseFloat(amount),
          currency,
          pay_currency: payCurrency,
          pay_network: network,
          fee_payer: feePayer,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCreatedInvoice({
          id: json.data.id,
          deposit_address: json.data.deposit_address,
          pay_amount: json.data.pay_amount,
        });
      } else {
        alert(json.message || "Failed to create invoice");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error creating invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!createdInvoice) return;
    setSimulating(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/invoices/simulate-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deposit_address: createdInvoice.deposit_address,
          amount: parseFloat(createdInvoice.pay_amount),
          network,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSimulationResult("Payment confirmed! Auto-payout triggered & webhook dispatched.");
      } else {
        setSimulationResult("Simulation failed: " + json.message);
      }
    } catch (err: unknown) {
      setSimulationResult("Network error during simulation");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0E14] text-zinc-100 p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded-full">
            Sandbox Simulator
          </span>
        </div>

        {/* Invoice Creation Form */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Create Test Invoice
            </h1>
            <p className="text-xs text-zinc-400">Generate a live deposit address on local backend</p>
          </div>

          <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Order ID</label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Network</label>
                <select
                  value={network}
                  onChange={(e) => {
                    const net = e.target.value as Network;
                    setNetwork(net);
                    setPayCurrency(net === "SOLANA" ? "USDC" : "USDT");
                  }}
                  className="w-full bg-zinc-800/80 border border-zinc-700/60 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="TRON">TRON (TRC-20)</option>
                  <option value="BSC">BSC (BEP-20)</option>
                  <option value="POLYGON">Polygon</option>
                  <option value="SOLANA">Solana (SPL)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Token</label>
                <input
                  type="text"
                  value={payCurrency}
                  readOnly
                  className="w-full bg-zinc-800/40 border border-zinc-700/40 rounded-xl px-3 py-2 text-zinc-400 cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Fee Payer</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFeePayer("customer")}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    feePayer === "customer"
                      ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                      : "bg-zinc-800/40 border-zinc-700/40 text-zinc-400 hover:text-zinc-300"
                  }`}
                >
                  Customer (Surcharge)
                </button>
                <button
                  type="button"
                  onClick={() => setFeePayer("merchant")}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    feePayer === "merchant"
                      ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400"
                      : "bg-zinc-800/40 border-zinc-700/40 text-zinc-400 hover:text-zinc-300"
                  }`}
                >
                  Merchant (Absorbed)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-zinc-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Generate Deposit Address
            </button>
          </form>
        </div>

        {/* Created Invoice & Simulator Controls */}
        {createdInvoice && (
          <div className="bg-zinc-900/90 border border-cyan-800/40 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Invoice Active
              </span>

              <Link
                href={`/checkout/${createdInvoice.id}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
              >
                Open Checkout Screen
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/60 text-xs space-y-1.5 font-mono">
              <div className="text-zinc-400 text-[11px]">DEPOSIT ADDRESS</div>
              <div className="text-zinc-200 truncate select-all">{createdInvoice.deposit_address}</div>
              <div className="text-zinc-400 text-[11px] pt-1">EXACT AMOUNT</div>
              <div className="text-cyan-400 font-semibold">{createdInvoice.pay_amount} {payCurrency}</div>
            </div>

            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={simulating}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {simulating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              Simulate Blockchain Payment Deposit
            </button>

            {simulationResult && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs text-center">
                {simulationResult}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
