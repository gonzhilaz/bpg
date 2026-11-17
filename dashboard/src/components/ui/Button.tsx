"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-zinc-950 font-bold shadow-md shadow-cyan-500/10 border border-transparent",
  secondary:
    "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700/80 font-medium",
  outline:
    "bg-transparent hover:bg-zinc-800/60 text-zinc-300 hover:text-white border border-zinc-700 font-medium",
  danger:
    "bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/30 font-medium",
  ghost:
    "bg-transparent hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 border-transparent font-medium",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-xs sm:text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-sm sm:text-base rounded-xl gap-2.5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      icon,
      iconRight,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const isLocked = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isLocked}
        aria-busy={isLoading}
        className={`inline-flex items-center justify-center font-sans tracking-tight transition-all duration-150 ease-out select-none ${
          isLocked
            ? "opacity-60 cursor-not-allowed pointer-events-none active:scale-100"
            : "cursor-pointer active:scale-95 active:brightness-90 hover:brightness-110 hover:shadow-md"
        } ${isLoading ? "animate-pulse" : ""} ${variantStyles[variant]} ${sizeStyles[size]} ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        {...props}
      >
        {/* Loading Spinner or Leading Icon */}
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}

        {/* Morphing Label */}
        <span>{isLoading && loadingText ? loadingText : children}</span>

        {/* Trailing Icon (Hidden while loading) */}
        {!isLoading && iconRight && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
