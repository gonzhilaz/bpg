"use client";

import React, { useState } from "react";
import {
  Terminal,
  X,
  Copy,
  Check,
  RotateCw,
  Hash,
  Send,
} from "lucide-react";
import { WebhookDeliveryLog } from "../../types/merchant";

interface Props {
  log: WebhookDeliveryLog;
  onClose: () => void;
  onReplay: (log: WebhookDeliveryLog) => void;
  isReplaying?: boolean;
}

export function WebhookInspectModal({ log, onClose, onReplay, isReplaying }: Props) {
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedHeader, setCopiedHeader] = useState<string | null>(null);

  const deliveryId = log.delivery_id || `del_${log.id}`;

  const copyToClipboard = (text: string, type: "payload" | "header", headerName?: string) => {
    navigator.clipboard.writeText(text);
    if (type === "payload") {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    } else if (headerName) {
      setCopiedHeader(headerName);
      setTimeout(() => setCopiedHeader(null), 2000);
    }
  };

  const isSuccess = log.status_code >= 200 && log.status_code < 300;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Webhook Payload Inspector • <span className="font-mono text-cyan-400">{log.event}</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Delivery Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800 font-mono text-[11px]">
            <div>
              <span className="text-zinc-500 block">HTTP Status</span>
              <span className={`font-bold ${isSuccess ? "text-emerald-400" : "text-rose-400"}`}>
                {log.status_code} {isSuccess ? "OK" : "Error"}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Latency</span>
              <span className="text-zinc-200">{log.duration_ms} ms</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Order ID</span>
              <span className="text-zinc-200">{log.order_id}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Delivery Time</span>
              <span className="text-zinc-400">{log.timestamp}</span>
            </div>
          </div>

          {/* Delivery ID & Idempotency Key */}
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                X-13C-Delivery-ID / Idempotency-Key
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(deliveryId, "header", "delivery_id")}
                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {copiedHeader === "delivery_id" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHeader === "delivery_id" ? "Copied" : "Copy ID"}</span>
              </button>
            </div>
            <div className="font-mono text-cyan-300 text-xs px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80">
              {deliveryId}
            </div>
          </div>

          {/* Destination URL */}
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Destination URL
            </span>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-zinc-300 break-all">
              {log.url}
            </div>
          </div>

          {/* Signature Header */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                HTTP Header: X-13C-Signature
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(log.signature, "header", "signature")}
                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {copiedHeader === "signature" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHeader === "signature" ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-cyan-300 text-[11px] break-all">
              {log.signature}
            </div>
          </div>

          {/* Request Payload */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Request JSON Body
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(log.payload, "payload")}
                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer"
              >
                {copiedPayload ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPayload ? "Copied" : "Copy JSON"}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-48">
              {log.payload}
            </pre>
          </div>

          {/* Endpoint Response Body */}
          <div>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Server Response Received
            </span>
            <pre className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-400 overflow-x-auto">
              {log.response_body || "No response body recorded"}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            13C Gateway Dispatcher Engine v2.0
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onReplay(log)}
              disabled={isReplaying}
              className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isReplaying ? "animate-spin" : ""}`} />
              <span>{isReplaying ? "Replaying..." : "Replay This Event"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

