"use client";

import React from "react";
import { FileCode, CheckCircle2, GitBranch, ShieldCheck } from "lucide-react";

export function DatabaseMigrationsCard() {
  const migrations = [
    {
      version: "000001",
      name: "init_schema.up.sql",
      impact: "merchants, invoices, payouts, hot_wallets",
      appliedAt: "2026-11-10 14:02:11 UTC",
      duration: "18ms",
      batch: 1,
      status: "APPLIED",
    },
    {
      version: "000002",
      name: "add_auth_and_status.up.sql",
      impact: "merchants (role, status, api_key_hash)",
      appliedAt: "2026-11-11 09:15:33 UTC",
      duration: "12ms",
      batch: 2,
      status: "APPLIED",
    },
    {
      version: "000003",
      name: "add_fee_payer.up.sql",
      impact: "invoices, payouts (fee_payer, network_fee)",
      appliedAt: "2026-11-12 18:40:02 UTC",
      duration: "9ms",
      batch: 3,
      status: "APPLIED",
    },
    {
      version: "000004",
      name: "add_database_indexes.up.sql",
      impact: "idx_invoices_deposit, idx_webhooks_pending",
      appliedAt: "2026-11-13 08:30:19 UTC",
      duration: "24ms",
      batch: 4,
      status: "APPLIED",
    },
  ];

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Applied SQL Migrations & Schema Checksums
          </h2>
        </div>
        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Schema Version 000004 (Up to Date)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] font-sans">
              <th className="pb-2">Version</th>
              <th className="pb-2">Migration Script</th>
              <th className="pb-2">Schema Target</th>
              <th className="pb-2">Applied At (UTC)</th>
              <th className="pb-2 text-right">Duration</th>
              <th className="pb-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50 text-[11px]">
            {migrations.map((m) => (
              <tr key={m.version} className="hover:bg-zinc-800/30 transition-colors">
                <td className="py-2.5 font-bold text-cyan-400">{m.version}</td>
                <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{m.name}</span>
                </td>
                <td className="py-2.5 text-zinc-300 font-sans">{m.impact}</td>
                <td className="py-2.5 text-zinc-400 font-sans">{m.appliedAt}</td>
                <td className="py-2.5 text-right text-zinc-300">{m.duration}</td>
                <td className="py-2.5 text-right font-sans">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
