"use client";

import React, { useState } from "react";
import { Users, Eye, Pencil, Key, Ban, CheckCircle2, Trash2, X, AlertTriangle } from "lucide-react";
import { AdminMerchant } from "../../types/admin";
import { Tooltip } from "../ui/Tooltip";
import { IconButton } from "../ui/IconButton";
import { MerchantDetailModal } from "./MerchantDetailModal";
import { MerchantEditModal } from "./MerchantEditModal";

interface Props {
  initialMerchants: AdminMerchant[];
}

export function MerchantControlTable({ initialMerchants }: Props) {
  const [merchants, setMerchants] = useState<AdminMerchant[]>(initialMerchants);
  const [selectedMerchant, setSelectedMerchant] = useState<AdminMerchant | null>(null);
  const [editingMerchant, setEditingMerchant] = useState<AdminMerchant | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [rotatedKeyNotice, setRotatedKeyNotice] = useState<{ name: string; rawKey: string } | null>(null);

  // Sync state if initialMerchants changes (e.g. search filter)
  React.useEffect(() => {
    setMerchants(initialMerchants);
  }, [initialMerchants]);

  const handleToggleStatus = (id: string) => {
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: m.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" }
          : m
      )
    );
  };

  const handleSaveEdit = (updated: AdminMerchant) => {
    setMerchants((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setEditingMerchant(null);
  };

  const handleRotateKey = (m: AdminMerchant) => {
    const rawKey = `13c_live_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    const prefix = `${rawKey.substring(0, 16)}...`;
    setMerchants((prev) =>
      prev.map((item) => (item.id === m.id ? { ...item, api_key_prefix: prefix } : item))
    );
    setRotatedKeyNotice({ name: m.name, rawKey });
  };

  const handleDelete = (id: string) => {
    setMerchants((prev) => prev.filter((m) => m.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Registered Merchants</h2>
          <Tooltip content="Comprehensive governance table. Use icon buttons to audit, edit, rotate keys, suspend, or delete merchant accounts." />
        </div>
        <span className="text-xs text-zinc-500 font-mono">{merchants.length} registered</span>
      </div>

      {/* Key Rotated Toast / Notice */}
      {rotatedKeyNotice && (
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-300">New API Key for {rotatedKeyNotice.name}</span>
            <button
              onClick={() => setRotatedKeyNotice(null)}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-2 rounded bg-zinc-950 font-mono text-emerald-400 select-all break-all border border-zinc-800">
            {rotatedKeyNotice.rawKey}
          </div>
          <p className="text-[10px] text-zinc-400">Save this key now. It will never be displayed again.</p>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
              <th className="pb-3 pr-4">Merchant Name</th>
              <th className="pb-3 px-4">API Key</th>
              <th className="pb-3 px-4">Total Volume</th>
              <th className="pb-3 px-4">Invoices</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 pl-4 text-right">Actions</th>
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
                <td className="py-3 pl-4 font-sans text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* 1. Read (View Detail) */}
                    <IconButton
                      icon={Eye}
                      tooltip="View Details"
                      onClick={() => setSelectedMerchant(m)}
                      variant="ghost"
                      size="xs"
                    />

                    {/* 2. Update (Edit Profile) */}
                    <IconButton
                      icon={Pencil}
                      tooltip="Edit Merchant"
                      onClick={() => setEditingMerchant(m)}
                      size="xs"
                    />

                    {/* 3. Rotate Key */}
                    <IconButton
                      icon={Key}
                      tooltip="Rotate API Key"
                      onClick={() => handleRotateKey(m)}
                      size="xs"
                    />

                    {/* 4. Toggle Status */}
                    {m.status === "ACTIVE" ? (
                      <IconButton
                        icon={Ban}
                        tooltip="Suspend Merchant"
                        onClick={() => handleToggleStatus(m.id)}
                        variant="danger"
                        size="xs"
                      />
                    ) : (
                      <IconButton
                        icon={CheckCircle2}
                        tooltip="Activate Merchant"
                        onClick={() => handleToggleStatus(m.id)}
                        size="xs"
                        className="text-emerald-400 hover:text-emerald-300"
                      />
                    )}

                    {/* 5. Delete */}
                    <IconButton
                      icon={Trash2}
                      tooltip="Delete Merchant"
                      onClick={() => setDeletingId(m.id)}
                      variant="danger"
                      size="xs"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Detail Modal */}
      {selectedMerchant && (
        <MerchantDetailModal
          merchant={selectedMerchant}
          onClose={() => setSelectedMerchant(null)}
        />
      )}

      {/* Edit Modal */}
      {editingMerchant && (
        <MerchantEditModal
          merchant={editingMerchant}
          onSave={handleSaveEdit}
          onClose={() => setEditingMerchant(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Confirm Merchant Deletion</span>
            </div>
            <p className="text-zinc-400">
              Are you sure you want to permanently delete this merchant account? Their API key and checkout access will be revoked immediately.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
