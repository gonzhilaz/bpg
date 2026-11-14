"use client";

import React from "react";
import { Check, X, ShieldAlert, Sparkles } from "lucide-react";

export function ComparisonTable() {
  const rows = [
    {
      feature: "Platform Processing Fee",
      bpg: "0.00% (Zero cut)",
      oxapay: "0.40% – 1.00%",
      custodial: "0.50% – 1.20%",
      highlight: true,
    },
    {
      feature: "Fund Custody & Settlement",
      bpg: "100% Direct-to-Wallet",
      oxapay: "Custodial Holding Wallet",
      custodial: "Custodial Pool",
      highlight: false,
    },
    {
      feature: "KYC / Merchant Verification",
      bpg: "None (Permissionless)",
      oxapay: "Tiered KYC verification",
      custodial: "Mandatory KYC / Business ID",
      highlight: false,
    },
    {
      feature: "Risk of Account Freezes",
      bpg: "0% (Sovereign DB)",
      oxapay: "Moderate (TOS Violations)",
      custodial: "High (AML/Bank Flags)",
      highlight: true,
    },
    {
      feature: "Real-Time Payment Detection",
      bpg: "Sub-Second SSE Stream",
      oxapay: "Polling & Webhooks",
      custodial: "Polling",
      highlight: false,
    },
    {
      feature: "No-Code Payment Links",
      bpg: "Yes (Built-in)",
      oxapay: "Yes",
      custodial: "Add-on fee",
      highlight: false,
    },
    {
      feature: "Webhook Replay Console",
      bpg: "Yes (1-Click Re-dispatch)",
      oxapay: "Limited retry",
      custodial: "Basic logs only",
      highlight: false,
    },
    {
      feature: "2FA Google Authenticator (TOTP)",
      bpg: "Yes (RFC 6238)",
      oxapay: "Yes",
      custodial: "Yes",
      highlight: false,
    },
    {
      feature: "Source Code Ownership",
      bpg: "100% Self-Hosted Go/Next.js",
      oxapay: "Closed Proprietary Cloud",
      custodial: "Closed SaaS",
      highlight: true,
    },
  ];

  return (
    <section id="comparison" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Transparent Comparison</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          How 13C Gateway Stacks Up Against OxaPay
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
          Compare architecture, fee structures, and sovereignty across modern crypto checkout
          solutions.
        </p>
      </div>

      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/70 font-sans font-semibold text-zinc-300">
                <th className="py-4 px-5">Capability / Metric</th>
                <th className="py-4 px-5 text-cyan-400 bg-cyan-950/30 border-x border-cyan-800/40 font-bold">
                  13C Gateway (Self-Hosted)
                </th>
                <th className="py-4 px-5">OxaPay</th>
                <th className="py-4 px-5">NOWPayments / Others</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-zinc-800/30 transition-colors ${
                    row.highlight ? "bg-cyan-500/5" : ""
                  }`}
                >
                  <td className="py-3.5 px-5 font-medium text-zinc-300">{row.feature}</td>
                  <td className="py-3.5 px-5 font-semibold text-emerald-400 bg-cyan-950/20 border-x border-cyan-800/30 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{row.bpg}</span>
                  </td>
                  <td className="py-3.5 px-5 text-zinc-400">{row.oxapay}</td>
                  <td className="py-3.5 px-5 text-zinc-400">{row.custodial}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
