import React from "react";
import { CheckCircle2, Radio } from "lucide-react";
import { WebhookLog } from "../../types/merchant";
import { Tooltip } from "../ui/Tooltip";

interface Props {
  logs: WebhookLog[];
}

export function WebhookLogsCard({ logs }: Props) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Webhook Logs</h2>
          <Tooltip content="Live HTTP callback notifications delivered to your e-commerce platform." />
        </div>
        <span className="text-xs text-zinc-500 font-mono">HMAC-SHA256 Signed</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-sans font-medium">
              <th className="pb-3 pr-4">Event</th>
              <th className="pb-3 px-4">Order ID</th>
              <th className="pb-3 px-4">Destination URL</th>
              <th className="pb-3 px-4">HTTP Status</th>
              <th className="pb-3 pl-4">Delivered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="py-3 pr-4 font-semibold text-cyan-400">{log.event}</td>
                <td className="py-3 px-4 text-zinc-200">{log.order_id}</td>
                <td className="py-3 px-4 text-zinc-400 truncate max-w-[180px]" title={log.url}>
                  {log.url}
                </td>
                <td className="py-3 px-4 font-sans">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    {log.status_code} OK
                  </span>
                </td>
                <td className="py-3 pl-4 text-zinc-500 text-[11px]">{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

