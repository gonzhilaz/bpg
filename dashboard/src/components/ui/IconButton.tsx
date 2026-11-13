"use client";

import React, { useState } from "react";
import { LucideIcon } from "lucide-react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  tooltip?: string;
  variant?: "default" | "primary" | "danger" | "ghost" | "cyan";
  size?: "xs" | "sm" | "md";
  loading?: boolean;
}

export function IconButton({
  icon: Icon,
  tooltip,
  variant = "default",
  size = "sm",
  loading = false,
  className = "",
  disabled,
  ...props
}: IconButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = {
    xs: "p-1 rounded-lg text-xs",
    sm: "p-1.5 rounded-xl text-xs",
    md: "p-2 rounded-xl text-sm",
  };

  const iconSizes = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
  };

  const variantClasses = {
    default:
      "bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/80 active:scale-95",
    primary:
      "bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 active:scale-95",
    danger:
      "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 active:scale-95",
    cyan:
      "bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold active:scale-95 shadow-sm shadow-cyan-500/20",
    ghost:
      "bg-transparent hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 active:scale-95",
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        disabled={disabled || loading}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={`inline-flex items-center justify-center transition-all disabled:opacity-50 disabled:pointer-events-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        aria-label={tooltip || props["aria-label"]}
        {...props}
      >
        <Icon className={`${iconSizes[size]} ${loading ? "animate-spin" : ""}`} />
      </button>

      {tooltip && showTooltip && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-2 py-1 text-[11px] font-medium text-white bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl pointer-events-none whitespace-nowrap animate-in fade-in duration-100"
        >
          {tooltip}
        </span>
      )}
    </div>
  );
}
