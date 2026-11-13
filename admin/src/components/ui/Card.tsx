"use client";

import React from "react";
import { Tooltip } from "./Tooltip";

interface CardProps {
  title?: string;
  tooltip?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: "bento" | "carbon" | "subtle";
}

export function Card({
  title,
  tooltip,
  icon: Icon,
  action,
  children,
  className = "",
  variant = "carbon",
}: CardProps) {
  const variantStyles = {
    bento:
      "rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-sm p-4 md:p-5 backdrop-blur-sm",
    carbon:
      "rounded-2xl bg-[#111622] border border-[#1E2638] shadow-sm p-4 font-sans",
    subtle:
      "rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-3",
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-cyan-400" />}
            {title && (
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {title}
              </h3>
            )}
            {tooltip && <Tooltip content={tooltip} />}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

