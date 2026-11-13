"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, RotateCcw, Receipt, ChevronDown } from "lucide-react";
import { useEnvironment } from "../../../context/EnvironmentContext";
import { useLanguage } from "../../../context/LanguageContext";
import { InvoicesTable } from "../../../components/dashboard/InvoicesTable";
import { IconButton } from "../../../components/ui/IconButton";
import { Tooltip } from "../../../components/ui/Tooltip";
import { Network } from "../../../types/merchant";

export default function InvoicesPage() {
  const { invoices } = useEnvironment();
  const { t } = useLanguage();
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

  const isFiltered = search !== "" || selectedNetwork !== "ALL" || selectedStatus !== "ALL";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{t("invoicesTitle")}</h1>
        <p className="text-xs text-zinc-400 mt-1">
          {t("invoicesSubtitle")}
        </p>
      </div>

      {/* Filter Toolbar: Search + Dropdown Filters + Reset */}
      <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchInvoicePlaceholder")}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          {/* Network Dropdown */}
          <div className="relative min-w-[170px]">
            <Filter className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="w-full appearance-none bg-zinc-950/80 border border-zinc-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
            >
              <option value="ALL">{t("filterNetwork")}</option>
              <option value="BSC">BSC (BEP-20)</option>
              <option value="POLYGON">Polygon (PoS)</option>
              <option value="TRON">TRON (TRC-20)</option>
              <option value="SOLANA">Solana (SPL)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative min-w-[160px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full appearance-none bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
            >
              <option value="ALL">{t("filterStatus")}</option>
              <option value="PAID">{t("statusPaid")}</option>
              <option value="DETECTED">{t("statusDetected")}</option>
              <option value="PENDING">{t("statusPending")}</option>
              <option value="UNDERPAID">{t("statusUnderpaid")}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Reset Button */}
          {isFiltered && (
            <IconButton
              icon={RotateCcw}
              tooltip={t("reset")}
              onClick={handleReset}
              size="md"
            />
          )}
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
          <div className="text-sm font-semibold text-white">{t("emptyData")}</div>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {t("emptyFilterDesc")}
          </p>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition-colors mt-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t("reset")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
