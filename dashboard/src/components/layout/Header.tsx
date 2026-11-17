"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, Sun, Moon, Globe } from "lucide-react";
import { useEnvironment } from "../../context/EnvironmentContext";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { MerchantNotificationDropdown } from "./MerchantNotificationDropdown";

export function Header() {
  const pathname = usePathname();
  const { setIsMobileNavOpen, isDbConnected, isLoading, reload } = useEnvironment();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  const getBreadcrumb = () => {
    switch (pathname) {
      case "/":
        return t("overview");
      case "/invoices":
        return t("invoices");
      case "/payouts":
        return t("payouts");
      case "/wallets":
        return t("wallets");
      case "/api-keys":
        return t("apiKeys");
      case "/webhooks":
        return t("webhooks");
      case "/reports":
        return t("analytics");
      default:
        return t("overview");
    }
  };

  const toggleLang = () => {
    setLang(lang === "EN" ? "ID" : "EN");
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
          <span className="text-zinc-500 hidden sm:inline">{t("portal")}</span>
          <span className="text-zinc-600 hidden sm:inline">/</span>
          <span className="font-semibold text-white tracking-wide">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Right: Notifications, Language, Theme */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={reload}
          disabled={isLoading}
          className={`hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-xl border transition-all ${
            isDbConnected
              ? "text-emerald-400 bg-emerald-950/30 border-emerald-800/40 hover:bg-emerald-950/50"
              : "text-rose-400 bg-rose-950/30 border-rose-800/40 hover:bg-rose-950/50 animate-pulse"
          }`}
          title={isDbConnected ? "Connected to Real DB (PostgreSQL / SQLite WAL)" : "Database unreachable - Click to retry"}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isDbConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
            }`}
          />
          <span>{isDbConnected ? "Real DB Active" : "DB Disconnected"}</span>
        </button>

        {/* Merchant Notifications */}
        <MerchantNotificationDropdown />

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
      </div>
    </header>
  );
}
