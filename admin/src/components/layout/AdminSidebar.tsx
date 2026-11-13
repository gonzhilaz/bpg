"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Users,
  Flame,
  Activity,
  Database,
  TrendingUp,
  Sliders,
  Terminal,
  FileCode2,
  ExternalLink,
  X,
  AlertTriangle,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { useLanguage } from "../../context/LanguageContext";
import { getEnvUrl } from "../../utils/env";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  alertCount?: number;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { isMobileNavOpen, setIsMobileNavOpen, circuitBreaker, merchants } = useAdmin();
  const { t } = useLanguage();

  const navItems: NavItem[] = [
    { label: t("overview"), href: "/", icon: Shield },
    { label: t("merchants"), href: "/merchants", icon: Users, badge: `${merchants.length}` },
    {
      label: t("gasEngine"),
      href: "/gas-liquidity",
      icon: Flame,
      alertCount: 1,
    },
    { label: t("systemHealth"), href: "/watchers", icon: Activity, badge: "4" },
    { label: t("database"), href: "/database", icon: Database },
    { label: t("financial"), href: "/finance", icon: TrendingUp },
    { label: t("appSettings"), href: "/settings", icon: Sliders },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-[#0E121A] border-r border-zinc-800/80 text-zinc-300">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-cyan-500/20">
            <Shield className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">13C Platform</div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
              Super Admin & Dev
            </div>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileNavOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          aria-label="Close Navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* System Status Pill */}
      <div className="px-4 py-3 border-b border-zinc-800/50">
        <div
          className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-xs font-medium ${
            circuitBreaker
              ? "bg-rose-950/40 border-rose-800/50 text-rose-300"
              : "bg-emerald-950/30 border-emerald-800/50 text-emerald-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                circuitBreaker ? "bg-rose-500 animate-ping" : "bg-emerald-400"
              }`}
            />
            <span className="uppercase text-[11px] font-bold tracking-wider">
              {circuitBreaker ? "CIRCUIT PAUSED" : "SYSTEM OPERATIONAL"}
            </span>
          </div>
          <span className="text-[10px] text-zinc-400">v1.2</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 mb-2">
          Platform Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileNavOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-300 border-l-2 border-cyan-400 font-semibold"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-zinc-400"}`} />
                <span>{item.label}</span>
              </div>
              {item.alertCount !== undefined && item.alertCount > 0 ? (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-rose-600 text-white shadow-sm shadow-rose-600/50">
                  {item.alertCount}
                </span>
              ) : item.badge ? (
                <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-zinc-800/80 text-zinc-400">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}

        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 pt-6 mb-2">
          Portals & Cross-Links
        </div>

        <a
          href={getEnvUrl.merchant()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <span>{t("merchantPortal")}</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">LIVE</span>
        </a>

        <a
          href={getEnvUrl.sandbox()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>{t("simulatorSandbox")}</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">SIM</span>
        </a>

        <a
          href={getEnvUrl.swagger()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileCode2 className="w-4 h-4 text-cyan-400" />
            <span>{t("swaggerDocs")}</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">API</span>
        </a>
      </div>

      {/* Admin User Footer Profile */}
      <div className="p-3 border-t border-zinc-800/80">
        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Dev Admin Console</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              ROOT
            </span>
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">admin@13cgateway.internal</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-40">
        <NavContent />
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {isMobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <NavContent />
          </div>
        </div>
      )}
    </>
  );
}

