"use client";

import React from "react";
import Link from "next/link";
import { Zap, ArrowUp, ShieldCheck, ExternalLink, Code2 } from "lucide-react";
import { getEnvUrl } from "../../utils/env";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-zinc-800 bg-[#07090D] text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-zinc-950 font-bold">
                <Zap className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">13C Gateway</span>
            </div>
            <p className="text-zinc-500 leading-relaxed text-[11px]">
              Sovereign, non-custodial crypto payment infrastructure. 0% platform commissions with
              automated multi-chain settlement.
            </p>
            <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Ed25519 Sentinel Authority</span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div className="space-y-2.5">
            <div className="text-zinc-200 font-semibold uppercase tracking-wider text-[11px]">
              Portals
            </div>
            <ul className="space-y-1.5 text-zinc-400">
              <li>
                <Link href="/sandbox" className="hover:text-white transition-colors">
                  Interactive Sandbox
                </Link>
              </li>
              <li>
                <a
                  href={getEnvUrl.merchant()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>Merchant Portal</span>
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </li>
              <li>
                <a
                  href={getEnvUrl.admin()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>Admin Console</span>
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Developer Resources */}
          <div className="space-y-2.5">
            <div className="text-zinc-200 font-semibold uppercase tracking-wider text-[11px]">
              Developers
            </div>
            <ul className="space-y-1.5 text-zinc-400">
              <li>
                <a
                  href={getEnvUrl.swagger()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>Swagger OpenAPI</span>
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/gonzhilaz/bpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <Code2 className="w-3 h-3 text-cyan-400" />
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <span className="text-zinc-500">Go SDK • TypeScript SDK</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Compliance */}
          <div className="space-y-2.5">
            <div className="text-zinc-200 font-semibold uppercase tracking-wider text-[11px]">
              Compliance & Legal
            </div>
            <ul className="space-y-1.5 text-zinc-500 text-[11px]">
              <li>Non-Custodial Architecture</li>
              <li>Zero Fund Holding / Zero Escrow Pool</li>
              <li>Self-Hosted Software Protocol</li>
              <li>Privacy Policy &amp; Terms</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div>
            &copy; 2026 13C Payment Gateway. Sovereign Web3 Engineering.
          </div>

          {/* Back to Top Button */}
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Back to Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
