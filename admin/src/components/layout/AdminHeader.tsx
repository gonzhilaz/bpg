"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, AlertTriangle, AlertOctagon, CheckCircle2, Flame } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export function AdminHeader() {
  const pathname = usePathname();
  const { setIsMobileNavOpen, circuitBreaker, setCircuitBreaker, hotWallets } = useAdmin();

  const getBreadcrumb = () => {
    switch (pathname) {
      case "/":
        return "System Operations";
      case "/merchants":
        return "Merchant Governance";
      case "/gas-liquidity":
        return "Gas Liquidity & Sweeper";
      case "/watchers":
        return "Multi-Chain Watchers";
      case "/database":
        return "Database & Storage";
      case "/finance":
        return "Financial Revenue Ledger";
      case "/settings":
        return "Platform Settings";
      default:
        return "Admin Portal";
    }
  };

  const hasLowGas = hotWallets.some((w) => w.status === "LOW");

  return (
    <header className="h-16 px-4 md:px-6 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
      {/* Left: Mobile Menu & Dynamic Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 hidden sm:inline">Platform</span>
          <span className="text-zinc-600 hidden sm:inline">/</span>
          <span className="font-semibold text-white tracking-wide">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Right: Status Badges & Circuit Breaker */}
      <div className="flex items-center gap-3">
        {hasLowGas && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Polygon Gas Low</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setCircuitBreaker(!circuitBreaker)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            circuitBreaker
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
              : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
          }`}
        >
          <AlertOctagon className={`w-3.5 h-3.5 ${circuitBreaker ? "text-rose-400" : "text-zinc-400"}`} />
          <span>{circuitBreaker ? "Resume Payouts" : "Circuit Breaker"}</span>
        </button>
      </div>
    </header>
  );
}
