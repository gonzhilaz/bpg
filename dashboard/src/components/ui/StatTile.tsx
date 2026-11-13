"use client";

import React from "react";
import { Tooltip } from "./Tooltip";

interface StatTileProps {
  label: string;
  value: string | number;
  subValue?: string;
  tooltip?: string;
  icon?: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatTile({
  label,
  value,
  subValue,
  tooltip,
  icon: Icon,
  trend,
  trendUp,
  className = "",
}: StatTileProps) {
  return (
    <div className={`p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold tracking-wider uppercase">
        <div className="flex items-center gap-1.5 truncate">
          {Icon && <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
          <span className="truncate">{label}</span>
        </div>
        {tooltip && <Tooltip content={tooltip} />}
      </div>

      <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex items-baseline justify-between gap-2">
        <span>{value}</span>
        {trend && (
          <span
            className={`text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded ${
              trendUp
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-rose-500/15 text-rose-400"
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subValue && (
        <div className="text-[11px] text-zinc-500 truncate">{subValue}</div>
      )}
    </div>
  );
}
