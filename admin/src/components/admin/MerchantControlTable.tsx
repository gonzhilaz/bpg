"use client";

import React, { useState } from "react";
import { Users, Ban, CheckCircle2 } from "lucide-react";
import { AdminMerchant } from "../../types/admin";
import { Tooltip } from "../ui/Tooltip";

interface Props {
  initialMerchants: AdminMerchant[];
}

export function MerchantControlTable({ initialMerchants }: Props) {
  const [merchants, setMerchants] = useState<AdminMerchant[]>(initialMerchants);

  const toggleStatus = (id: string) => {
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: m.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" }
          : m
      )
    );
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Registered Merchants</h2>
          <Tooltip content="Manage and audit merchant accounts using the gateway." />
        </div>
        <span className="text-xs text-zinc-500">{merchants.length} registered</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
              <th className="pb-3 pr-4">Merchant Name</th>
              <th className="pb-3 px-4">API Key</th>
              <th className="pb-3 px-4">Total Volume</th>
              <th className="pb-3 px-4">Invoices</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 pl-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono">
            {merchants.map((m) => (
              <tr key={m.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="py-3 pr-4 font-sans font-semibold text-zinc-200">
                  {m.name}
                </td>
                <td className="py-3 px-4 text-zinc-400">{m.api_key_prefix}</td>
                <td className="py-3 px-4 text-emerald-400 font-medium">{m.volume_usd}</td>
                <td className="py-3 px-4 text-zinc-300 font-sans">{m.invoices_count} orders</td>
                <td className="py-3 px-4 font-sans">
                  {m.status === "ACTIVE" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                      <Ban className="w-3 h-3" />
                      Suspended
                    </span>
                  )}
                </td>
                <td className="py-3 pl-4 font-sans">
                  <button
                    type="button"
                    onClick={() => toggleStatus(m.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      m.status === "ACTIVE"
                        ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {m.status === "ACTIVE" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
