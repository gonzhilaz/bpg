"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Terminal, ArrowRight, Menu, X, ExternalLink } from "lucide-react";
import { getEnvUrl } from "../../utils/env";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0B0E14]/85 border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-zinc-950 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-tight leading-none">
              13C Gateway
            </span>
            <span className="text-[10px] font-mono text-cyan-400 tracking-wider">
              NON-CUSTODIAL
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-300 font-medium">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#calculator" className="hover:text-cyan-400 transition-colors">
            Fee Savings
          </a>
          <a href="#developers" className="hover:text-white transition-colors">
            Developers
          </a>
          <a href="#comparison" className="hover:text-white transition-colors">
            Vs OxaPay
          </a>
          <a
            href={getEnvUrl.swagger()}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
          >
            <span>Docs</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            href="/sandbox"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700/80 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-all"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sandbox Demo</span>
          </Link>
          <a
            href={getEnvUrl.merchant()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-zinc-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-md shadow-cyan-500/10"
          >
            <span>Merchant Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-[#0B0E14] px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col space-y-2.5 text-xs text-zinc-300 font-medium">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-zinc-800"
            >
              Features
            </a>
            <a
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-zinc-800 text-cyan-400"
            >
              Fee Savings Calculator
            </a>
            <a
              href="#developers"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-zinc-800"
            >
              Developers & SDKs
            </a>
            <a
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-zinc-800"
            >
              Vs OxaPay & Stripe
            </a>
          </nav>
          <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2">
            <Link
              href="/sandbox"
              className="w-full text-center py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-medium"
            >
              Sandbox Simulator
            </Link>
            <a
              href={getEnvUrl.merchant()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-2 rounded-xl bg-cyan-400 text-zinc-950 font-bold text-xs"
            >
              Open Merchant Portal
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
