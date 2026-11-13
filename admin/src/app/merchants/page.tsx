"use client";

import React, { useState, useMemo } from "react";
import { Users, Search, Plus, RotateCcw, Ban, CheckCircle2, ChevronDown, Building2 } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { useLanguage } from "../../context/LanguageContext";
import { MerchantControlTable } from "../../components/admin/MerchantControlTable";
import { StatTile } from "../../components/ui/StatTile";
import { IconButton } from "../../components/ui/IconButton";
import { Tooltip } from "../../components/ui/Tooltip";
import { AdminMerchant } from "../../types/admin";

export default function MerchantsPage() {
  const { merchants, setMerchants } = useAdmin();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMerchantName, setNewMerchantName] = useState("");
  const [newFeePayer, setNewFeePayer] = useState<"customer" | "merchant">("customer");

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
      volume_usd: "$0.00",
      invoices_count: 0,
      auto_payout: true,
      status: "ACTIVE",
      created_at: "Just now",
      fee_payer: newFeePayer,
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
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{t("merchants")}</span>
            <Tooltip content="Comprehensive merchant registry, real-time volume metrics, and instant access control." />
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Registered merchant profiles, API credentials, and governance.
          </p>
        </div>

        {/* Preferred Icon Button for Add Merchant */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <IconButton
            icon={Plus}
            tooltip="Add New Merchant"
            tooltipPlacement="left"
            onClick={() => setShowAddModal(true)}
            variant="primary"
            size="md"
          />
        </div>
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

      {/* Main Full-CRUD Table */}
      <MerchantControlTable initialMerchants={filteredMerchants} />

      {/* Add Merchant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Register New Merchant</h3>
              </div>
              <IconButton icon={Plus} tooltip="Close" onClick={() => setShowAddModal(false)} className="rotate-45" size="xs" />
            </div>

            <p className="text-zinc-400">
              Generates a dedicated API key and merchant profile with zero-custody routing.
            </p>

            <form onSubmit={handleAddMerchant} className="space-y-3.5 pt-1">
              <div>
                <label className="text-zinc-300 font-medium block mb-1">Business / Store Name</label>
                <input
                  type="text"
                  required
                  value={newMerchantName}
                  onChange={(e) => setNewMerchantName(e.target.value)}
                  placeholder="e.g. Acme Global Services"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-medium block mb-1">Fee Payer Policy</label>
                <select
                  value={newFeePayer}
                  onChange={(e) => setNewFeePayer(e.target.value as "customer" | "merchant")}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value="customer">Customer Adds Gas Fee</option>
                  <option value="merchant">Merchant Deducted from Sweeps</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-zinc-950 font-bold bg-cyan-400 hover:bg-cyan-300 transition-colors"
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
