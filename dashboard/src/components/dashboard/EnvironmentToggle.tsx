"use client";

import React from "react";
import { EnvironmentMode } from "../../types/merchant";
import { Tooltip } from "../ui/Tooltip";

interface Props {
  mode: EnvironmentMode;
  onToggle: (mode: EnvironmentMode) => void;
}

export function EnvironmentToggle({ mode, onToggle }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-1 bg-zinc-800/80 border border-zinc-700/60 rounded-xl flex items-center text-xs font-semibold">
        <button
          type="button"
          onClick={() => onToggle("LIVE")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
            mode === "LIVE"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${mode === "LIVE" ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
          Live
        </button>

        <button
          type="button"
          onClick={() => onToggle("SANDBOX")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
            mode === "SANDBOX"
              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${mode === "SANDBOX" ? "bg-amber-400 animate-pulse" : "bg-zinc-600"}`} />
          Sandbox
        </button>
      </div>

      <Tooltip content="Toggle between real blockchain transactions (Live) and testnet simulation (Sandbox)." />
    </div>
  );
}

