"use client";

import React, { useState, useMemo } from "react";
import { Users, Search, Plus, RotateCcw, ShieldCheck, Ban, CheckCircle2, ChevronDown } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { useLanguage } from "../../context/LanguageContext";
import { MerchantControlTable } from "../../components/admin/MerchantControlTable";
import { StatTile } from "../../components/ui/StatTile";
import { IconButton } from "../../components/ui/IconButton";
import { AdminMerchant } from "../../types/admin";

export default function MerchantsPage() {
  const { merchants, setMerchants } = useAdmin();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMerchantName, setNewMerchantName] = useState("");

  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      const matchSearch =
        search === "" ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.api_key_prefix.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" || m.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [merchants, search, statusFilter]);

  const activeCount = merchants.filter((m) => m.status === "ACTIVE").length;
  const suspendedCount = merchants.filter((m) => m.status === "SUSPENDED").length;

  const handleAddMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMerchantName.trim()) return;

    const newMerchant: AdminMerchant = {
      id: `m_${Date.now()}`,
      name: newMerchantName.trim(),
      api_key_prefix: `13c_live_${Math.random().toString(36).substring(2, 6)}...`,
      volume_usd: "0.00",
      invoices_count: 0,
      auto_payout: true,
      status: "ACTIVE",
      created_at: "Just now",
    };

    setMerchants([newMerchant, ...merchants]);
    setNewMerchantName("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Merchant Directory & Governance</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Audit registered merchants, inspect transaction throughput, and manage access controls.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Merchant</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatTile
          label="Total Merchants"
          value={merchants.length}
          icon={Users}
          tooltip="Total registered merchant profiles in gateway registry."
        />
        <StatTile
          label="Active Merchants"
          value={activeCount}
          icon={CheckCircle2}
          tooltip="Merchants with active status and valid API credentials."
          trend="Live"
          trendUp={true}
        />
        <StatTile
          label="Suspended"
          value={suspendedCount}
          icon={Ban}
          tooltip="Merchant profiles with temporarily revoked checkout access."
          trend={suspendedCount > 0 ? "Alert" : undefined}
          trendUp={false}
        />
      </div>

      {/* Search and Dropdown Filter */}
      <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search merchant name or API key..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-[150px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "SUSPENDED")}
              className="w-full appearance-none bg-zinc-950 border border-zinc-800 rounded-xl px-3 pr-8 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              <option value="ALL">{t("filterStatus")}</option>
              <option value="ACTIVE">{t("statusActive")}</option>
              <option value="SUSPENDED">{t("statusSuspended")}</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {(search !== "" || statusFilter !== "ALL") && (
            <IconButton
              icon={RotateCcw}
              tooltip={t("reset")}
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
            />
          )}
        </div>
      </div>

      {/* Main Table */}
      <MerchantControlTable initialMerchants={filteredMerchants} />

      {/* Add Merchant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Register New Merchant</h3>
            <p className="text-xs text-zinc-400">
              Generates a dedicated API key and merchant account on 13C Payment Gateway.
            </p>

            <form onSubmit={handleAddMerchant} className="space-y-4 pt-2">
              <div className="space-y-1 text-xs">
                <label className="text-zinc-300 font-medium">Business / Store Name</label>
                <input
                  type="text"
                  required
                  value={newMerchantName}
                  onChange={(e) => setNewMerchantName(e.target.value)}
                  placeholder="e.g. Acme Global Services"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
