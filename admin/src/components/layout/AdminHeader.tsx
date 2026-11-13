"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, AlertOctagon, Sun, Moon, Globe } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { AdminNotificationDropdown } from "./AdminNotificationDropdown";

export function AdminHeader() {
  const pathname = usePathname();
  const { setIsMobileNavOpen, circuitBreaker, setCircuitBreaker } = useAdmin();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  const getBreadcrumb = () => {
    switch (pathname) {
      case "/":
        return t("overview");
      case "/merchants":
        return t("merchants");
      case "/gas-liquidity":
        return t("gasEngine");
      case "/watchers":
        return t("systemHealth");
      case "/database":
        return t("database");
      case "/finance":
        return t("financial");
      case "/settings":
        return t("appSettings");
      default:
        return t("portal");
    }
  };

  const toggleLang = () => {
    setLang(lang === "EN" ? "ID" : "EN");
  };

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

      {/* Right: Notifications, Language, Theme & Circuit Breaker */}
      <div className="flex items-center gap-2.5">
        {/* Notification Bell Dropdown */}
        <AdminNotificationDropdown />

        {/* Language Selector */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 text-xs font-semibold border border-zinc-700/80 transition-colors"
          title={`Switch to ${lang === "EN" ? "Indonesian" : "English"}`}
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span>{lang}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/80 transition-colors"
          title={`Switch to ${theme === "dark" ? "Light Mode" : "Dark Mode"}`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-cyan-400" />
          )}
        </button>

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

