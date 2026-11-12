import React from "react";
import { CheckCircle2, Clock, Loader2, AlertCircle } from "lucide-react";
import { DashboardInvoice } from "../../types/merchant";

interface Props {
  invoices: DashboardInvoice[];
}

export function InvoicesTable({ invoices }: Props) {
  const renderStatus = (status: DashboardInvoice["status"]) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case "DETECTED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
            <Loader2 className="w-3 h-3 animate-spin" />
            Detected
          </span>
        );
      case "UNDERPAID":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" />
            Underpaid
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-400" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">Recent Invoices</h2>
        <span className="text-xs text-zinc-500">{invoices.length} orders</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
              <th className="pb-3 pr-4">Order</th>
              <th className="pb-3 px-4">Amount</th>
              <th className="pb-3 px-4">Network</th>
              <th className="pb-3 px-4">Deposit Address</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 pl-4">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="py-3 pr-4 font-semibold text-zinc-200">{inv.order_id}</td>
                <td className="py-3 px-4 text-zinc-100 font-medium">
                  {inv.pay_amount} <span className="text-cyan-400">{inv.pay_currency}</span>
                </td>
                <td className="py-3 px-4 text-zinc-400">{inv.pay_network}</td>
                <td className="py-3 px-4 text-zinc-400 truncate max-w-[140px]" title={inv.deposit_address}>
                  {inv.deposit_address}
                </td>
                <td className="py-3 px-4 font-sans">{renderStatus(inv.status)}</td>
                <td className="py-3 pl-4 text-zinc-500 text-[11px]">{inv.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

