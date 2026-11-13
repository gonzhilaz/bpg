"use client";

import React from "react";

interface BadgeProps {
  children?: React.ReactNode;
  count?: number;
  variant?: "default" | "success" | "danger" | "warning" | "cyan";
  isCircle?: boolean;
  pulse?: boolean;
  className?: string;
}

export function Badge({
  children,
  count,
  variant = "default",
  isCircle = false,
  pulse = false,
  className = "",
}: BadgeProps) {
  const variantStyles = {
    default: "bg-zinc-800 text-zinc-300 border-zinc-700/60",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    danger: "bg-rose-500 text-white shadow-sm shadow-rose-500/50 border-rose-600",
    warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    cyan: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  };

  if (count !== undefined) {
    if (count <= 0) return null;
    return (
      <span
        className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full border ${variantStyles[variant]} ${className}`}
      >
        {pulse && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
        )}
        <span>{count}</span>
      </span>
    );
  }

  if (isCircle) {
    return (
      <span
        className={`inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full border ${variantStyles[variant]} ${className}`}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium rounded-md border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

