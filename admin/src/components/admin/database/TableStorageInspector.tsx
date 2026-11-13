"use client";

import React, { useState } from "react";
import { Layers, Database, Sparkles, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";

interface TableStat {
  name: string;
  rows: number;
  dataSize: string;
  indexSize: string;
  totalBytes: number;
  totalFormatted: string;
  deadTuples: number;
  bloatPercent: number;
  autoVacuum: string;
  status: "OPTIMAL" | "ATTENTION";
}

export function TableStorageInspector() {
  const [tables] = useState<TableStat[]>([
    {
      name: "invoices",
      rows: 1240,
      dataSize: "4.2 MB",
      indexSize: "1.8 MB",
      totalBytes: 6.0,
      totalFormatted: "6.0 MB",
      deadTuples: 48,
      bloatPercent: 3.8,
      autoVacuum: "2h ago",
      status: "OPTIMAL",
    },
    {
      name: "payouts",
      rows: 980,
      dataSize: "2.8 MB",
      indexSize: "1.1 MB",
      totalBytes: 3.9,
      totalFormatted: "3.9 MB",
      deadTuples: 18,
      bloatPercent: 1.8,
      autoVacuum: "4h ago",
      status: "OPTIMAL",
    },
    {
      name: "transactions",
      rows: 2540,
      dataSize: "8.6 MB",
      indexSize: "3.4 MB",
      totalBytes: 12.0,
      totalFormatted: "12.0 MB",
      deadTuples: 124,
      bloatPercent: 4.8,
      autoVacuum: "1h ago",
      status: "OPTIMAL",
    },
    {
      name: "webhook_deliveries",
      rows: 8920,
      dataSize: "14.2 MB",
      indexSize: "5.8 MB",
      totalBytes: 20.0,
      totalFormatted: "20.0 MB",
      deadTuples: 1140,
      bloatPercent: 12.8,
      autoVacuum: "12m ago",
      status: "ATTENTION",
    },
    {
      name: "audit_logs",
      rows: 12400,
      dataSize: "18.5 MB",
      indexSize: "6.2 MB",
      totalBytes: 24.7,
      totalFormatted: "24.7 MB",
      deadTuples: 780,
      bloatPercent: 6.2,
      autoVacuum: "30m ago",
      status: "OPTIMAL",
    },
    {
      name: "merchants",
      rows: 14,
      dataSize: "64 KB",
      indexSize: "32 KB",
      totalBytes: 0.1,
      totalFormatted: "96 KB",
      deadTuples: 0,
      bloatPercent: 0.0,
      autoVacuum: "1d ago",
      status: "OPTIMAL",
    },
  ]);

  const maxBytes = Math.max(...tables.map((t) => t.totalBytes));

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Table Storage & Index Footprint Audit
          </h2>
        </div>
        <span className="text-[11px] text-zinc-400">
          6 tables audited • B-Tree index scan validated
        </span>
      </div>

      {/* Table Storage Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800/80 text-zinc-400 text-[11px]">
              <th className="pb-2.5 font-semibold">Table Name</th>
              <th className="pb-2.5 font-semibold text-right">Row Count</th>
              <th className="pb-2.5 font-semibold text-right">Data</th>
              <th className="pb-2.5 font-semibold text-right">Indexes</th>
              <th className="pb-2.5 font-semibold pl-4">Storage Footprint</th>
              <th className="pb-2.5 font-semibold text-right">Bloat %</th>
              <th className="pb-2.5 font-semibold text-center">Auto-Vacuum</th>
              <th className="pb-2.5 font-semibold text-right">Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50 font-mono text-[11px]">
            {tables.map((tbl) => (
              <tr key={tbl.name} className="hover:bg-zinc-800/30 transition-colors">
                <td className="py-2.5 font-bold font-sans text-white flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{tbl.name}</span>
                </td>
                <td className="py-2.5 text-right text-zinc-200">{tbl.rows.toLocaleString()}</td>
                <td className="py-2.5 text-right text-zinc-400">{tbl.dataSize}</td>
                <td className="py-2.5 text-right text-zinc-400">{tbl.indexSize}</td>
                <td className="py-2.5 pl-4">
                  <div className="flex items-center gap-2 w-32 sm:w-44">
                    <div className="flex-1 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${Math.max((tbl.totalBytes / maxBytes) * 100, 4)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-300 w-12 text-right">{tbl.totalFormatted}</span>
                  </div>
                </td>
                <td className="py-2.5 text-right">
                  <span
                    className={
                      tbl.bloatPercent > 10
                        ? "text-rose-400 font-bold"
                        : "text-zinc-400"
                    }
                  >
                    {tbl.bloatPercent}%
                  </span>
                </td>
                <td className="py-2.5 text-center text-zinc-500 font-sans">{tbl.autoVacuum}</td>
                <td className="py-2.5 text-right">
                  {tbl.status === "OPTIMAL" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Optimal
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      <AlertCircle className="w-3 h-3" />
                      Reindex / Prune
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
