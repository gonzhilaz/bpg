import React from "react";
import { CheckCircle2, ArrowUpRight } from "lucide-react";
import { PayoutRecord } from "../../types/merchant";

interface Props {
  payouts: PayoutRecord[];
}

export function PayoutsTable({ payouts }: Props) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">Settlement Transfers</h2>
        <span className="text-xs text-zinc-500">Auto-forwarded to cold wallet</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-medium">
              <th className="pb-3 pr-4">Network</th>
              <th className="pb-3 px-4">Amount Sent</th>
              <th className="pb-3 px-4">Recipient Wallet</th>
              <th className="pb-3 px-4">Tx Hash</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 pl-4">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono">
            {payouts.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="py-3 pr-4 text-zinc-300 font-semibold">{p.network}</td>
                <td className="py-3 px-4 text-emerald-400 font-medium">+{p.amount_sent}</td>
                <td className="py-3 px-4 text-zinc-400 truncate max-w-[130px]" title={p.recipient_address}>
                  {p.recipient_address}
                </td>
                <td className="py-3 px-4 text-cyan-400 flex items-center gap-1">
                  <span>{p.payout_tx_hash}</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                </td>
                <td className="py-3 px-4 font-sans">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Completed
                  </span>
                </td>
                <td className="py-3 pl-4 text-zinc-500 text-[11px]">{p.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
