"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "EN" | "ID";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  EN: {
    // Nav & Common
    overview: "Overview",
    merchants: "Merchants",
    gasEngine: "Gas Engine",
    systemHealth: "System Health",
    database: "Database",
    financial: "Financial",
    appSettings: "App Settings",
    merchantPortal: "Merchant Portal",
    simulatorSandbox: "Simulator Sandbox",
    swaggerDocs: "Swagger Engine",
    logout: "Sign Out",
    search: "Search",
    reset: "Reset",
    all: "ALL",
    status: "Status",
    actions: "Actions",
    loading: "Loading...",
    emptyData: "No records found",
    emptyFilterDesc: "Try adjusting your search criteria or resetting filters.",
    retry: "Retry",
    copy: "Copy",
    copied: "Copied!",
    portal: "Admin Control",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    language: "Language",
    filterStatus: "All Statuses",
    statusActive: "Active",
    statusSuspended: "Suspended",
  },
  ID: {
    // Nav & Common
    overview: "Ikhtisar",
    merchants: "Daftar Merchant",
    gasEngine: "Mesin Gas",
    systemHealth: "Kesehatan Sistem",
    database: "Basis Data",
    financial: "Finansial",
    appSettings: "Pengaturan Aplikasi",
    merchantPortal: "Portal Merchant",
    simulatorSandbox: "Simulator Sandbox",
    swaggerDocs: "Mesin Swagger",
    logout: "Keluar",
    search: "Cari",
    reset: "Atur Ulang",
    all: "SEMUA",
    status: "Status",
    actions: "Aksi",
    loading: "Memuat...",
    emptyData: "Data tidak ditemukan",
    emptyFilterDesc: "Coba sesuaikan kata kunci pencarian atau atur ulang filter Anda.",
    retry: "Coba Lagi",
    copy: "Salin",
    copied: "Tersalin!",
    portal: "Kontrol Admin",
    lightMode: "Mode Terang",
    darkMode: "Mode Gelap",
    language: "Bahasa",
    filterStatus: "Semua Status",
    statusActive: "Aktif",
    statusSuspended: "Ditangguhkan",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("EN");

  useEffect(() => {
    const saved = localStorage.getItem("13c_admin_lang") as Language;
    if (saved === "EN" || saved === "ID") {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("13c_admin_lang", newLang);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations["EN"]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

