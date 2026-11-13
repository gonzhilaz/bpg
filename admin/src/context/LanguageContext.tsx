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
    action: "Action",
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
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    connected: "Connected",

    // Overview & Metrics
    totalVolume: "Total Volume",
    feeRevenue: "Fee Revenue",
    circuitBreaker: "Circuit Breaker",
    gasLiquidity: "Gas Liquidity",
    multiChainWatchers: "Multi-Chain Watchers",
    databaseEngine: "Database Engine",
    financialRevenue: "Financial Revenue",
    platformParameters: "Platform Parameters",
    gasReserves: "Gas Reserves",

    // Merchants
    registerMerchant: "Add Merchant",
    totalMerchants: "Total Merchants",
    activeMerchants: "Active Merchants",
    suspended: "Suspended",
    searchMerchantPlaceholder: "Search merchant name or API key...",

    // Gas Engine
    triggerSweep: "Trigger Sweep",
    allNetworks: "All Networks",
    gasPriceMatrix: "Gas & Price Matrix",

    // Watchers & RPC
    activeRpcProviders: "Active RPC Providers",
    addRpc: "Add RPC Node",
    rpcEndpoint: "RPC Endpoint",
    provider: "Provider",
    network: "Network",
    latency: "Latency",
    testPing: "Test Ping",
    restart: "Restart",

    // Database & Maintenance
    poolActive: "Pool Active",
    tableStorage: "Table Footprint",
    maintenanceOps: "Maintenance Ops",
    backupManager: "Backup & DR",
    sqlMigrations: "SQL Migrations",
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
    action: "Aksi",
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
    save: "Simpan",
    cancel: "Batal",
    delete: "Hapus",
    connected: "Terhubung",

    // Overview & Metrics
    totalVolume: "Total Volume",
    feeRevenue: "Pendapatan Biaya",
    circuitBreaker: "Sakelar Darurat",
    gasLiquidity: "Likuiditas Gas",
    multiChainWatchers: "Pemantau Multi-Rantai",
    databaseEngine: "Mesin Basis Data",
    financialRevenue: "Pendapatan Finansial",
    platformParameters: "Parameter Platform",
    gasReserves: "Cadangan Gas",

    // Merchants
    registerMerchant: "Tambah Merchant",
    totalMerchants: "Total Merchant",
    activeMerchants: "Merchant Aktif",
    suspended: "Ditangguhkan",
    searchMerchantPlaceholder: "Cari nama merchant atau kunci API...",

    // Gas Engine
    triggerSweep: "Picu Sweep",
    allNetworks: "Semua Jaringan",
    gasPriceMatrix: "Matriks Gas & Harga",

    // Watchers & RPC
    activeRpcProviders: "Penyedia RPC Aktif",
    addRpc: "Tambah Node RPC",
    rpcEndpoint: "Endpoint RPC",
    provider: "Penyedia",
    network: "Jaringan",
    latency: "Latensi",
    testPing: "Uji Ping",
    restart: "Mulai Ulang",

    // Database & Maintenance
    poolActive: "Pool Aktif",
    tableStorage: "Ukuran Tabel",
    maintenanceOps: "Operasi Pemeliharaan",
    backupManager: "Cadangan & DR",
    sqlMigrations: "Migrasi SQL",
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
