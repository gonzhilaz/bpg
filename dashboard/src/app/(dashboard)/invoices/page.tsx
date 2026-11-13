"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, RotateCcw, Receipt } from "lucide-react";
import { useEnvironment } from "../../../context/EnvironmentContext";
import { InvoicesTable } from "../../../components/dashboard/InvoicesTable";
import { Network } from "../../../types/merchant";

export default function InvoicesPage() {
  const { invoices } = useEnvironment();
  const [search, setSearch] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        search === "" ||
        inv.order_id.toLowerCase().includes(search.toLowerCase()) ||
        inv.deposit_address.toLowerCase().includes(search.toLowerCase()) ||
        inv.id.toLowerCase().includes(search.toLowerCase());

      const matchNetwork =
        selectedNetwork === "ALL" || inv.pay_network === selectedNetwork;

      const matchStatus =
        selectedStatus === "ALL" || inv.status === selectedStatus;

      return matchSearch && matchNetwork && matchStatus;
    });
  }, [invoices, search, selectedNetwork, selectedStatus]);

  const handleReset = () => {
    setSearch("");
    setSelectedNetwork("ALL");
    setSelectedStatus("ALL");
  };

  const networks: (Network | "ALL")[] = ["ALL", "BSC", "POLYGON", "TRON", "SOLANA"];
  const statuses = ["ALL", "PAID", "DETECTED", "PENDING", "UNDERPAID"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Invoices & Orders</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Monitor incoming customer payments, blockchain detections, and confirmation states.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, Invoice ID, or Deposit Address..."
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          {(search !== "" || selectedNetwork !== "ALL" || selectedStatus !== "ALL") && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Network & Status Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-800/60">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">
              Network:
            </span>
            {networks.map((net) => (
              <button
                key={net}
                onClick={() => setSelectedNetwork(net)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedNetwork === net
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                {net}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mr-1">
              Status:
            </span>
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedStatus === st
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices List or Empty State */}
      {filteredInvoices.length > 0 ? (
        <InvoicesTable invoices={filteredInvoices} />
      ) : (
        <div className="p-12 text-center bg-zinc-900/40 border border-zinc-800/80 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 flex items-center justify-center text-zinc-400 mx-auto">
            <Receipt className="w-6 h-6" />
          </div>
          <div className="text-sm font-semibold text-white">No invoices matched your criteria</div>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the network and status filters.
          </p>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition-colors mt-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
