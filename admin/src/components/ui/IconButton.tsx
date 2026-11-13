"use client";

import React, { useState, useRef } from "react";
import { LucideIcon } from "lucide-react";

export type TooltipPlacement = "auto" | "top" | "bottom" | "left" | "right";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  tooltip?: string;
  tooltipPlacement?: TooltipPlacement;
  variant?: "default" | "primary" | "danger" | "ghost" | "cyan";
  size?: "xs" | "sm" | "md";
  loading?: boolean;
}

export function IconButton({
  icon: Icon,
  tooltip,
  tooltipPlacement = "auto",
  variant = "default",
  size = "sm",
  loading = false,
  className = "",
  disabled,
  ...props
}: IconButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [positionClasses, setPositionClasses] = useState("bottom-full left-1/2 -translate-x-1/2 mb-2");
  const [arrowClasses, setArrowClasses] = useState("top-full left-1/2 -translate-x-1/2 border-t-zinc-800");

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

  const calculatePosition = () => {
    if (!containerRef.current || typeof window === "undefined") return;
    const rect = containerRef.current.getBoundingClientRect();
    const winWidth = window.innerWidth;

    const isNearRight = rect.right > winWidth - 130;
    const isNearLeft = rect.left < 90;
    const isNearTop = rect.top < 50;

    let vClass = isNearTop || tooltipPlacement === "bottom" ? "top-full mt-2" : "bottom-full mb-2";
    let hClass = "left-1/2 -translate-x-1/2";
    let arrV = isNearTop || tooltipPlacement === "bottom" ? "bottom-full border-b-zinc-800" : "top-full border-t-zinc-800";
    let arrH = "left-1/2 -translate-x-1/2";

    if (isNearRight || tooltipPlacement === "left") {
      hClass = "right-0 translate-x-0";
      arrH = "right-2 translate-x-0";
    } else if (isNearLeft || tooltipPlacement === "right") {
      hClass = "left-0 translate-x-0";
      arrH = "left-2 translate-x-0";
    }

    setPositionClasses(`${vClass} ${hClass}`);
    setArrowClasses(`${arrV} ${arrH}`);
  };

  const handleMouseEnter = () => {
    calculatePosition();
    setShowTooltip(true);
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        disabled={disabled || loading}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={handleMouseEnter}
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
          className={`absolute z-50 px-2.5 py-1 text-[11px] font-semibold text-zinc-100 bg-zinc-950/95 border border-zinc-700/80 rounded-lg shadow-2xl pointer-events-none whitespace-nowrap max-w-[calc(100vw-24px)] backdrop-blur-md animate-in fade-in zoom-in-95 duration-100 ${positionClasses}`}
        >
          {tooltip}
          <span
            className={`absolute w-0 h-0 border-4 border-transparent pointer-events-none ${arrowClasses}`}
          />
        </span>
      )}
    </div>
  );
}
