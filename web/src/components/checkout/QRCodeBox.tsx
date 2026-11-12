"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Network } from "../../types/invoice";
import { Tooltip } from "../ui/Tooltip";

interface Props {
  depositAddress: string;
  payAmount: string;
  payCurrency: string;
  network: Network;
}

export function QRCodeBox({ depositAddress, payAmount, payCurrency, network }: Props) {
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const copyToClipboard = (text: string, type: "addr" | "amount") => {
    navigator.clipboard.writeText(text);
    if (type === "addr") {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const getExplorerUrl = () => {
    switch (network) {
      case "BSC":
        return `https://bscscan.com/address/${depositAddress}`;
      case "POLYGON":
        return `https://polygonscan.com/address/${depositAddress}`;
      case "TRON":
        return `https://tronscan.org/#/address/${depositAddress}`;
      case "SOLANA":
        return `https://solscan.io/account/${depositAddress}`;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Dynamic QR Code Card */}
      <div className="relative p-3.5 bg-white rounded-2xl shadow-xl shadow-cyan-950/20 border border-zinc-700/50">
        <QRCodeSVG
          value={depositAddress}
          size={180}
          level="M"
          includeMargin={false}
          className="rounded-lg"
        />
        <div className="absolute inset-0 border border-black/5 rounded-2xl pointer-events-none" />
      </div>

      {/* Amount Copy Row */}
      <div className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center">
            Exact Amount
            <Tooltip content="Please transfer this exact amount to complete the invoice." />
          </div>
          <div className="text-base font-semibold text-zinc-100 font-mono">
            {payAmount} <span className="text-cyan-400">{payCurrency}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => copyToClipboard(payAmount, "amount")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-700/60 hover:bg-zinc-700 text-zinc-200 transition-colors"
        >
          {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copiedAmount ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Address Copy Row */}
      <div className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center">
            Deposit Address
            <Tooltip content="One-time dedicated deposit address generated for this invoice." />
          </div>
          <div className="text-xs font-mono text-zinc-200 truncate select-all" title={depositAddress}>
            {depositAddress}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => copyToClipboard(depositAddress, "addr")}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-700/60 hover:bg-zinc-700 text-zinc-200 transition-colors"
          >
            {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedAddr ? "Copied" : "Copy"}
          </button>

          <a
            href={getExplorerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-700/50 transition-colors"
            title="View on Explorer"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
