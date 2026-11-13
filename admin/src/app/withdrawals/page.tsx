"use client";

import React, { useState } from "react";
import {
  WalletCards,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  Check,
  X,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { AdminWithdrawalRequest, Network } from "../../types/admin";
import { Tooltip } from "../../components/ui/Tooltip";
import { IconButton } from "../../components/ui/IconButton";

// Mock initial data in accordance with Pillar 1
const mockWithdrawals: AdminWithdrawalRequest[] = [
  {
    id: "wd-001",
    merchant_id: "m-1",
    merchant_name: "13C Demo Store",
    amount: "150.00",
    currency: "USDT",
    network: "TRON",
    target_address: "TYUKBQ1AHuC6U1Qj88J7sE5FzW7xJg9vEa",
    status: "PENDING",
    requested_at: "2026-11-13T10:15:00Z",
  },
  {
    id: "wd-002",
    merchant_id: "m-2",
    merchant_name: "CryptoGadgets Indonesia",
    amount: "320.00",
    currency: "USDT",
    network: "POLYGON",
    target_address: "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
    status: "PENDING",
    requested_at: "2026-11-13T09:40:00Z",
  },
  {
    id: "wd-003",
    merchant_id: "m-3",
    merchant_name: "SaaS Cloud Hosting",
    amount: "85.00",
    currency: "USDT",
    network: "BSC",
    target_address: "0x88492021Bca4e3419Fa82D1219b18991823901",
    status: "COMPLETED",
    tx_hash: "0xescrow_payout_bsc_784921901a8b",
    requested_at: "2026-11-12T16:20:00Z",
  },
];

export default function AdminWithdrawalsPage() {
  const [requests, setRequests] = useState<AdminWithdrawalRequest[]>(mockWithdrawals);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [approvingReq, setApprovingReq] = useState<AdminWithdrawalRequest | null>(null);
  const [rejectingReq, setRejectingReq] = useState<AdminWithdrawalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const filtered = requests.filter((r) => (statusFilter === "ALL" ? true : r.status === statusFilter));

  const totalEscrow = requests.reduce((acc, r) => acc + (r.status === "PENDING" ? parseFloat(r.amount) : 0), 0);
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  const handleApprove = () => {
    if (!approvingReq) return;
    const txHash = `0xescrow_payout_${approvingReq.network.toLowerCase()}_${Date.now().toString(16)}`;
    setRequests((prev) =>
      prev.map((r) => (r.id === approvingReq.id ? { ...r, status: "COMPLETED", tx_hash: txHash } : r))
    );
    setNotice(`Approved $${approvingReq.amount} USDT payout for ${approvingReq.merchant_name}`);
    setApprovingReq(null);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleReject = () => {
    if (!rejectingReq || !rejectReason.trim()) return;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === rejectingReq.id ? { ...r, status: "REJECTED", admin_notes: rejectReason.trim() } : r
      )
    );
    setNotice(`Rejected payout for ${rejectingReq.merchant_name} (Balance refunded)`);
    setRejectingReq(null);
    setRejectReason("");
    setTimeout(() => setNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Escrow & Payouts</span>
            <Tooltip content="Centralized governance for accumulated merchant escrow balances and payout approvals." />
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Review pending merchant withdrawal requests, trigger on-chain payouts, or refund disputed balances.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center justify-between animate-in fade-in">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-zinc-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total Pending Escrow</span>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">${totalEscrow.toFixed(2)}</div>
          <span className="text-[11px] text-zinc-500">Held in platform vault</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Pending Approvals</span>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{pendingCount} Requests</div>
          <span className="text-[11px] text-zinc-500">Awaiting developer broadcast</span>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Min Payout Threshold</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">$50.00 USD</div>
          <span className="text-[11px] text-zinc-500">Enforced by gateway rules</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium">Filter Status:</span>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 pr-8 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Requests</option>
              <option value="PENDING">Pending Approval</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <span className="text-xs text-zinc-500 font-mono">{filtered.length} records</span>
      </div>

      {/* Requests Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
                <th className="pb-3 pr-4">Merchant</th>
                <th className="pb-3 px-4">Amount</th>
                <th className="pb-3 px-4">Network</th>
                <th className="pb-3 px-4">Destination</th>
                <th className="pb-3 px-4">Status</th>
                <th className="pb-3 px-4">Requested At</th>
                <th className="pb-3 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 font-sans">
                    No withdrawal requests matching the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 pr-4 font-sans font-semibold text-white">
                      {req.merchant_name || req.merchant_id}
                    </td>
                    <td className="py-3.5 px-4 text-cyan-400 font-bold">
                      ${req.amount} <span className="text-[10px] text-zinc-400">{req.currency}</span>
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">
                        {req.network}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 truncate max-w-[180px]" title={req.target_address}>
                      {req.target_address}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          req.status === "COMPLETED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : req.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {req.status === "PENDING" && <Clock className="w-2.5 h-2.5" />}
                        {req.status === "COMPLETED" && <Check className="w-2.5 h-2.5" />}
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 text-[11px]">
                      {new Date(req.requested_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 pl-4 font-sans text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {req.status === "PENDING" && (
                          <>
                            <IconButton
                              icon={CheckCircle2}
                              tooltip="Approve Payout"
                              onClick={() => setApprovingReq(req)}
                              className="text-emerald-400 hover:text-emerald-300"
                              size="xs"
                            />
                            <IconButton
                              icon={XCircle}
                              tooltip="Reject & Refund"
                              onClick={() => setRejectingReq(req)}
                              variant="danger"
                              size="xs"
                            />
                          </>
                        )}
                        {req.status === "COMPLETED" && req.tx_hash && (
                          <IconButton
                            icon={ExternalLink}
                            tooltip="Inspect On-Chain Hash"
                            onClick={() => alert(`TxHash: ${req.tx_hash}`)}
                            size="xs"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {approvingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4 text-xs font-sans">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Approve Escrow Payout</h3>
            </div>
            <p className="text-zinc-400">
              Broadcast on-chain transfer of <strong className="text-white">${approvingReq.amount} USDT</strong> on{" "}
              <strong>{approvingReq.network}</strong> to:
            </p>
            <div className="p-2.5 rounded-xl bg-zinc-950 font-mono text-[11px] text-cyan-400 break-all border border-zinc-800">
              {approvingReq.target_address}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setApprovingReq(null)}
                className="px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-colors"
              >
                Confirm & Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4 text-xs font-sans">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Reject & Refund Balance</h3>
            </div>
            <p className="text-zinc-400">
              Refunds <strong className="text-white">${rejectingReq.amount} USDT</strong> back to {rejectingReq.merchant_name}&apos;s escrow balance.
            </p>
            <div>
              <label className="text-zinc-400 block mb-1">Rejection Reason</label>
              <input
                type="text"
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Invalid wallet format / Compliance review"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setRejectingReq(null)}
                className="px-3 py-1.5 rounded-xl text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold transition-colors disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

