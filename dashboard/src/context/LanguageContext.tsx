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
    invoices: "Invoices & Orders",
    payouts: "Payouts & Settlements",
    wallets: "Wallets & Gas",
    apiKeys: "API Credentials",
    webhooks: "Webhooks",
    analytics: "Financial Analytics",
    sandboxSimulator: "Simulator Sandbox",
    swaggerDocs: "Swagger API Docs",
    logout: "Sign Out",
    search: "Search",
    reset: "Reset",
    all: "ALL",
    network: "Network",
    status: "Status",
    actions: "Actions",
    loading: "Loading...",
    emptyData: "No records found",
    emptyFilterDesc: "Try adjusting your search criteria or resetting filters.",
    retry: "Retry",
    copy: "Copy",
    copied: "Copied!",
    portal: "Merchant Portal",
    adminPortal: "Admin Portal",
    connected: "Hot Wallet Connected",
    sandboxActive: "Sandbox & Testnet Active",
    environment: "Environment",
    live: "Live",
    sandbox: "Sandbox",
    save: "Save",
    saved: "Saved!",
    cancel: "Cancel",

    // Invoices Page
    invoicesTitle: "Invoices & Orders",
    invoicesSubtitle: "Monitor incoming customer payments, blockchain detections, and confirmation states.",
    searchInvoicePlaceholder: "Search by Order ID, Invoice ID, or Deposit Address...",
    filterNetwork: "All Networks",
    filterStatus: "All Statuses",
    statusPaid: "Paid",
    statusDetected: "Detected",
    statusPending: "Pending",
    statusUnderpaid: "Underpaid",
    statusExpired: "Expired",
    colOrder: "Order & Invoice",
    colNetwork: "Network & Asset",
    colAmount: "Invoice Amount",
    colDeposit: "Deposit Address",
    colStatus: "Status",
    colActions: "Details",
    feePayerMerchant: "Merchant Pays Gas",
    feePayerCustomer: "Customer Pays Gas",

    // Wallets & Gas
    walletsTitle: "Wallets & Gas",
    walletsSubtitle: "Cold wallet settlement addresses, fee payer rules, and live network gas rates.",
    gasEstimates: "Real-Time Gas Estimates",
    sweepTriggers: "Automated Sweep Configuration",
    payoutWallets: "Payout Wallets",
    feePayer: "Fee Payer",
    customer: "Customer",
    merchant: "Merchant",
    autoPayout: "Auto-Payout",

    // Payouts
    payoutsTitle: "Payouts & Settlements",
    payoutsSubtitle: "Blockchain payout transactions and settlement verification.",
    requestPayout: "Request Payout",
    totalSettled: "Total Settled",
    settlementEngine: "Settlement Engine",
    gasPolicy: "Gas Policy",
    coldWallets: "Cold Wallets",

    // Financial Reports
    financialLedger: "Financial Ledger",
    financialTitle: "Financial Accounting",
    financialSubtitle: "Revenue breakdowns, fee deductions, and net settlement reconciliations.",
    feeEfficiency: "Fee Efficiency",
    grossSales: "Gross Sales",
    netSettled: "Net Settled",
    fee: "Fee (0.4%)",
    sweepGas: "Sweep Gas",

    // API Keys
    apiKeysTitle: "API Credentials & Security",
    apiKeysSubtitle: "Strict 1 merchant = 1 API Key architecture with HMAC-SHA256 signature enforcement.",
    regenerateKey: "Rotate API Key",

    // Webhooks
    webhooksTitle: "Webhook Delivery Logs",
    webhooksSubtitle: "Real-time HTTP push notifications dispatched upon payment events.",
    webhookEndpoint: "Webhook Endpoint",
    webhookLogs: "Webhook Logs",
    testPing: "Test Ping",

    // Theme & Language
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    language: "Language",
  },
  ID: {
    // Nav & Common
    overview: "Ikhtisar",
    invoices: "Faktur & Pesanan",
    payouts: "Pencairan & Penyelesaian",
    wallets: "Dompet & Gas",
    apiKeys: "Kredensial API",
    webhooks: "Webhooks",
    analytics: "Analitik Finansial",
    sandboxSimulator: "Simulator Sandbox",
    swaggerDocs: "Dokumentasi API Swagger",
    logout: "Keluar",
    search: "Cari",
    reset: "Atur Ulang",
    all: "SEMUA",
    network: "Jaringan",
    status: "Status",
    actions: "Aksi",
    loading: "Memuat...",
    emptyData: "Data tidak ditemukan",
    emptyFilterDesc: "Coba sesuaikan kata kunci pencarian atau atur ulang filter Anda.",
    retry: "Coba Lagi",
    copy: "Salin",
    copied: "Tersalin!",
    portal: "Portal Merchant",
    adminPortal: "Portal Admin",
    connected: "Hot Wallet Terhubung",
    sandboxActive: "Sandbox & Testnet Aktif",
    environment: "Lingkungan",
    live: "Utama (Live)",
    sandbox: "Simulasi (Sandbox)",
    save: "Simpan",
    saved: "Tersimpan!",
    cancel: "Batal",

    // Invoices Page
    invoicesTitle: "Faktur & Pesanan",
    invoicesSubtitle: "Pantau pembayaran pelanggan, deteksi transaksi blockchain, dan status konfirmasi.",
    searchInvoicePlaceholder: "Cari berdasarkan ID Pesanan, ID Faktur, atau Alamat Deposit...",
    filterNetwork: "Semua Jaringan",
    filterStatus: "Semua Status",
    statusPaid: "Lunas",
    statusDetected: "Terdeteksi",
    statusPending: "Menunggu",
    statusUnderpaid: "Kurang Bayar",
    statusExpired: "Kedaluwarsa",
    colOrder: "Pesanan & Faktur",
    colNetwork: "Jaringan & Aset",
    colAmount: "Nominal Faktur",
    colDeposit: "Alamat Deposit",
    colStatus: "Status",
    colActions: "Detail",
    feePayerMerchant: "Biaya Gas oleh Merchant",
    feePayerCustomer: "Biaya Gas oleh Pelanggan",

    // Wallets & Gas
    walletsTitle: "Dompet & Gas",
    walletsSubtitle: "Alamat dompet dingin tujuan pencairan, penanggung gas, dan harga gas jaringan terkini.",
    gasEstimates: "Estimasi Biaya Gas Real-Time",
    sweepTriggers: "Konfigurasi Sweep Otomatis",
    payoutWallets: "Dompet Pencairan",
    feePayer: "Penanggung Gas",
    customer: "Pelanggan",
    merchant: "Merchant",
    autoPayout: "Pencairan Otomatis",

    // Payouts
    payoutsTitle: "Pencairan & Penyelesaian",
    payoutsSubtitle: "Transaksi pencairan blockchain dan verifikasi penerimaan dompet dingin.",
    requestPayout: "Ajukan Pencairan",
    totalSettled: "Total Dicairkan",
    settlementEngine: "Mesin Pencairan",
    gasPolicy: "Kebijakan Gas",
    coldWallets: "Dompet Dingin",

    // Financial Reports
    financialLedger: "Buku Besar Finansial",
    financialTitle: "Akuntansi Finansial",
    financialSubtitle: "Rincian pendapatan, potongan margin sistem, dan rekonsiliasi pencairan bersih.",
    feeEfficiency: "Efisiensi Biaya",
    grossSales: "Penjualan Kotor",
    netSettled: "Pencairan Bersih",
    fee: "Biaya Layanan (0.4%)",
    sweepGas: "Gas Jaringan",

    // API Keys
    apiKeysTitle: "Kredensial API & Keamanan",
    apiKeysSubtitle: "Arsitektur ketat 1 Merchant = 1 API Key dengan validasi tanda tangan HMAC-SHA256.",
    regenerateKey: "Rotasi API Key",

    // Webhooks
    webhooksTitle: "Catatan Webhook",
    webhooksSubtitle: "Notifikasi push HTTP real-time saat transaksi pembayaran terkonfirmasi.",
    webhookEndpoint: "Titik Akhir Webhook",
    webhookLogs: "Catatan Webhook",
    testPing: "Uji Ping",

    // Theme & Language
    lightMode: "Mode Terang",
    darkMode: "Mode Gelap",
    language: "Bahasa",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("EN");

  useEffect(() => {
    const saved = localStorage.getItem("13c_lang") as Language;
    if (saved === "EN" || saved === "ID") {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("13c_lang", newLang);
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
