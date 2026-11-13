"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Zap,
  LayoutDashboard,
  Receipt,
  ArrowUpRight,
  Wallet,
  Key,
  Webhook,
  TrendingUp,
  Terminal,
  FileCode2,
  LogOut,
  X,
  ExternalLink,
} from "lucide-react";
import { useEnvironment } from "../../context/EnvironmentContext";
import { useLanguage } from "../../context/LanguageContext";
import { Tooltip } from "../ui/Tooltip";
import { getEnvUrl } from "../../utils/env";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode, profile, invoices, isMobileNavOpen, setIsMobileNavOpen } = useEnvironment();
  const { t } = useLanguage();

  const navItems: NavItem[] = [
    { label: t("overview"), href: "/", icon: LayoutDashboard },
    { label: t("invoices"), href: "/invoices", icon: Receipt, badge: `${invoices.length}` },
    { label: t("payouts"), href: "/payouts", icon: ArrowUpRight },
    { label: t("wallets"), href: "/wallets", icon: Wallet },
    { label: t("apiKeys"), href: "/api-keys", icon: Key },
    { label: t("webhooks"), href: "/webhooks", icon: Webhook },
    { label: t("analytics"), href: "/reports", icon: TrendingUp },
  ];

  const handleLogout = () => {
    localStorage.removeItem("13c_token");
    router.push("/login");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-[#0E121A] border-r border-zinc-800/80 text-zinc-300">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-zinc-950 shadow-lg shadow-cyan-500/20">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">13C Gateway</div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
              Merchant Portal
            </div>
          </div>
        </div>

        {/* Mobile Close Button (Hamburger Drawer) */}
        <button
          onClick={() => setIsMobileNavOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          aria-label="Close Navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Interactive Environment Toggle (Sidebar & Mobile Hamburger) */}
      <div className="px-3.5 py-3 border-b border-zinc-800/50 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
          <span>{t("environment")}</span>
          <Tooltip content="Toggle between real blockchain transactions (Live) and testnet simulation (Sandbox)." />
        </div>

        <div className="grid grid-cols-2 p-1 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs font-semibold gap-1">
          <button
            type="button"
            onClick={() => setMode("LIVE")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
              mode === "LIVE"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                mode === "LIVE" ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
              }`}
            />
            <span>Live</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("SANDBOX")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
              mode === "SANDBOX"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                mode === "SANDBOX" ? "bg-amber-400 animate-pulse" : "bg-zinc-600"
              }`}
            />
            <span>Sandbox</span>
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 mb-2">
          Management
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
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-zinc-800 text-zinc-400 font-mono">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 pt-6 mb-2">
          {t("portal")}
        </div>

        <a
          href={getEnvUrl.sandbox()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>{t("sandboxSimulator")}</span>
          </div>
          <ExternalLink className="w-3 h-3 text-zinc-400" />
        </a>

        <a
          href={getEnvUrl.swagger()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileCode2 className="w-4 h-4 text-emerald-400" />
            <span>{t("swaggerDocs")}</span>
          </div>
          <ExternalLink className="w-3 h-3 text-zinc-400" />
        </a>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-zinc-800/80">
        <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="min-w-0 flex-1 mr-2">
            <div className="text-xs font-semibold text-white truncate">{profile.name}</div>
            <div className="text-[10px] text-zinc-400 truncate">ID: {profile.id}</div>
          </div>
          <button
            onClick={handleLogout}
            title={t("logout")}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
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

      {/* Mobile Slide-Over Drawer with Backdrop (Hamburger) */}
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
