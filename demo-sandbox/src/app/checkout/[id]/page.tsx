"use client";

import React, { useEffect, useState, use, Suspense } from "react";
import { ArrowLeft, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Invoice } from "../../../types/invoice";
import { fetchInvoiceById, getInvoiceSSEUrl } from "../../../services/api";
import { PaymentStatusPill } from "../../../components/checkout/PaymentStatusPill";
import { CountdownTimer } from "../../../components/checkout/CountdownTimer";
import { QRCodeBox } from "../../../components/checkout/QRCodeBox";
import { Web3PayButton } from "../../../components/checkout/Web3PayButton";
import { CheckoutSkeleton } from "../../../components/ui/Skeleton";
import { Tooltip } from "../../../components/ui/Tooltip";

function CheckoutContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const invoiceId = resolvedParams.id;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"qr" | "web3">("qr");

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInvoiceById(invoiceId);
      setInvoice(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();

    // 1. Real-Time SSE Stream for Instant Sub-Second Status Telemetry
    let es: EventSource | null = null;
    try {
      es = new EventSource(getInvoiceSSEUrl(invoiceId));
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.status) {
            setInvoice((prev) =>
              prev
                ? {
                    ...prev,
                    status: data.status,
                    received_amount: data.received_amount || prev.received_amount,
                  }
                : prev
            );
            if (data.status === "PAID" || data.status === "EXPIRED") {
              es?.close();
            }
          }
        } catch {
          // ignore parsing error
        }
      };
      es.onerror = () => {
        // SSE error, will fallback to interval poll
      };
    } catch {
      // EventSource fallback
    }

    // 2. Defensive Fallback Polling (10s interval)
    const interval = setInterval(async () => {
      try {
        const data = await fetchInvoiceById(invoiceId);
        setInvoice(data);
        if (data.status === "PAID" || data.status === "EXPIRED") {
          clearInterval(interval);
          es?.close();
        }
      } catch {
        // Silent poll error
      }
    }, 10000);

    return () => {
      es?.close();
      clearInterval(interval);
    };
  }, [invoiceId]);

  if (loading && !invoice) {
    return (
      <main className="min-h-screen bg-[#0B0E14] text-zinc-100 flex items-center justify-center p-4">
        <CheckoutSkeleton />
      </main>
    );
  }

  if (error && !invoice) {
    return (
      <main className="min-h-screen bg-[#0B0E14] text-zinc-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold">Invoice Error</h2>
          <p className="text-sm text-zinc-400">{error}</p>
          <button
            type="button"
            onClick={loadInvoice}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!invoice) return null;

  if (invoice.status === "PAID") {
    return (
      <main className="min-h-screen bg-[#0B0E14] text-zinc-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 bg-zinc-900/90 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-500/10 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-white">Payment Received</h1>
            <p className="text-xs text-zinc-400">Your order has been verified on-chain</p>
          </div>

          <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-4 text-left space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Order ID</span>
              <span className="font-mono text-zinc-200">{invoice.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Amount Paid</span>
              <span className="font-mono font-semibold text-emerald-400">
                {invoice.received_amount} {invoice.pay_currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Network</span>
              <span className="font-mono text-zinc-200">{invoice.pay_network}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full py-3 px-4 rounded-xl font-medium text-sm text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Merchant
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0E14] text-zinc-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800/90 rounded-2xl shadow-2xl shadow-cyan-950/20 overflow-hidden backdrop-blur-sm">
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">
              13C Pay
            </span>
          </div>

          <div className="flex items-center gap-2">
            <PaymentStatusPill status={invoice.status} />
            <CountdownTimer initialSeconds={invoice.seconds_remaining} />
          </div>
        </div>

        <div className="px-6 pt-5 pb-3 text-center space-y-1">
          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center justify-center">
            Total Payable
            <Tooltip content="Live crypto calculation based on your order total and network gas fee." />
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>{invoice.pay_amount}</span>
            <span className="text-cyan-400 text-lg">{invoice.pay_currency}</span>
          </div>

          {invoice.network_fee && invoice.base_amount && (
            <div className="mx-auto max-w-xs mt-2 p-2 bg-zinc-800/40 border border-zinc-700/40 rounded-lg text-[11px] text-zinc-400 font-mono space-y-1">
              <div className="flex justify-between">
                <span className="font-sans text-zinc-500">Order Subtotal</span>
                <span>{invoice.base_amount} {invoice.pay_currency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans text-zinc-500 flex items-center gap-1">
                  <span>Network Gas Fee</span>
                  <Tooltip content="On-chain blockchain gas fee for payment verification and settlement." />
                </span>
                <span className="text-emerald-400">+{invoice.network_fee} {invoice.pay_currency}</span>
              </div>
            </div>
          )}

          <div className="text-xs text-zinc-500 font-medium pt-1">
            Order #{invoice.order_id} • Network: <span className="text-zinc-300 font-semibold">{invoice.pay_network}</span>
          </div>
        </div>

        <div className="px-6 py-2">
          <div className="grid grid-cols-2 p-1 bg-zinc-800/60 rounded-xl border border-zinc-700/50 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("qr")}
              className={`py-2 rounded-lg transition-all ${
                activeTab === "qr"
                  ? "bg-zinc-700 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              QR Code / CEX
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("web3")}
              className={`py-2 rounded-lg transition-all ${
                activeTab === "web3"
                  ? "bg-zinc-700 text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              1-Click Wallet
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          {activeTab === "qr" ? (
            <QRCodeBox
              depositAddress={invoice.deposit_address}
              payAmount={invoice.pay_amount}
              payCurrency={invoice.pay_currency}
              network={invoice.pay_network}
            />
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-zinc-800/40 border border-zinc-700/40 rounded-xl text-center space-y-2">
                <div className="text-xs text-zinc-400">
                  Connect your browser wallet (MetaMask / Phantom) to transfer with one click.
                </div>
              </div>
              <Web3PayButton
                network={invoice.pay_network}
                payAmount={invoice.pay_amount}
                payCurrency={invoice.pay_currency}
                depositAddress={invoice.deposit_address}
              />
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 bg-zinc-950/40 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Non-Custodial Escrow</span>
          </div>
          <span>Automatic Settlement</span>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0B0E14] text-zinc-100 flex items-center justify-center p-4">
          <CheckoutSkeleton />
        </main>
      }
    >
      <CheckoutContent {...props} />
    </Suspense>
  );
}
