"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { useEnvironment } from "../../context/EnvironmentContext";
import { getEnvUrl } from "../../utils/env";

export function SandboxBanner() {
  const { mode } = useEnvironment();

  if (mode !== "SANDBOX") return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 md:px-6 py-2 text-xs text-amber-300 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span className="font-semibold">Sandbox & Testnet Active</span>
        <span className="text-amber-400/70 hidden sm:inline">• Simulated & Testnet Transactions</span>
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        <span className="text-zinc-400 hidden md:inline">Faucets:</span>
        <a
          href="https://www.nileex.io/join/getJoinPage"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-300 hover:underline"
        >
          TRON Nile
        </a>
        <span className="text-zinc-600">•</span>
        <a
          href="https://www.bnbchain.org/en/testnet-faucet"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-300 hover:underline"
        >
          BSC Testnet
        </a>
        <span className="text-zinc-600">•</span>
        <a
          href="https://faucet.solana.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-300 hover:underline"
        >
          Solana Devnet
        </a>
        <span className="text-zinc-600">•</span>
        <a
          href={getEnvUrl.sandbox()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold underline hover:text-white"
        >
          <span>Simulator</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

