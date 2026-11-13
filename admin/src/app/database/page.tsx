"use client";

import React from "react";
import { Database, HardDrive, CheckCircle2, Shield, Layers, FileCode } from "lucide-react";
import { DatabaseHealthCard } from "../../components/admin/DatabaseHealthCard";

export default function DatabasePage() {
  const migrations = [
    { version: "000001", name: "init_schema.up.sql", tables: "merchants, invoices, payouts", status: "APPLIED" },
    { version: "000002", name: "add_auth_and_status.up.sql", tables: "merchants (role, status, api_key_hash)", status: "APPLIED" },
    { version: "000003", name: "add_fee_payer.up.sql", tables: "invoices, payouts (fee_payer, network_fee)", status: "APPLIED" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Database Engine & Storage Maintenance</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Monitor connection pool health, row counts, execute data pruning, and verify schema migrations.
        </p>
      </div>

      {/* Main Database Health Card */}
      <DatabaseHealthCard />

      {/* Migrations Audit Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Applied SQL Migrations</h2>
          </div>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Schema Up to Date
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-sans font-medium">
                <th className="pb-3 pr-4">Version</th>
                <th className="pb-3 px-4">Migration Script</th>
                <th className="pb-3 px-4">Schema Impact</th>
                <th className="pb-3 pl-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {migrations.map((m) => (
                <tr key={m.version} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-3 pr-4 text-cyan-400 font-semibold">{m.version}</td>
                  <td className="py-3 px-4 text-zinc-200">{m.name}</td>
                  <td className="py-3 px-4 text-zinc-400 font-sans">{m.tables}</td>
                  <td className="py-3 pl-4 font-sans">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Applied
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

