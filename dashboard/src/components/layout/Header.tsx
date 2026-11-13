"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, ExternalLink } from "lucide-react";
import { useEnvironment } from "../../context/EnvironmentContext";
import { EnvironmentToggle } from "../dashboard/EnvironmentToggle";

export function Header() {
  const pathname = usePathname();
  const { mode, setMode, setIsMobileNavOpen } = useEnvironment();

  const getBreadcrumb = () => {
    switch (pathname) {
      case "/":
        return "Overview";
      case "/invoices":
        return "Invoices & Orders";
      case "/payouts":
        return "Payouts & Settlements";
      case "/wallets":
        return "Wallets & Gas";
      case "/api-keys":
        return "API Credentials";
      case "/webhooks":
        return "Webhook Logs";
      case "/reports":
        return "Financial Ledger";
      default:
        return "Dashboard";
    }
  };

  return (
    <header className="h-16 px-4 md:px-6 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
      {/* Left: Mobile Menu Button & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500 hidden sm:inline">Merchant</span>
          <span className="text-zinc-600 hidden sm:inline">/</span>
          <span className="font-semibold text-white tracking-wide">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Right: Environment Toggle & Quick Status */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Hot Wallet Connected</span>
        </div>

        <a
          href="http://localhost:3002"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 text-xs font-medium border border-zinc-700/80 transition-colors"
        >
          <span>Admin Portal</span>
          <ExternalLink className="w-3 h-3 text-zinc-400" />
        </a>

        <div className="h-5 w-px bg-zinc-800 hidden sm:block" />

        <EnvironmentToggle mode={mode} onToggle={setMode} />
      </div>
    </header>
  );
}

