import React from "react";
import { Shield, ExternalLink, ArrowUpRight, Terminal } from "lucide-react";
import {
  mockPlatformMetrics,
  mockHotWallets,
  mockWatchers,
  mockMerchantsList,
  mockNetworkGasList,
} from "../mocks/mockAdmin";
import { PlatformMetricsCard } from "../components/admin/PlatformMetricsCard";
import { HotWalletGasCard } from "../components/admin/HotWalletGasCard";
import { WatcherHealthCard } from "../components/admin/WatcherHealthCard";
import { MerchantControlTable } from "../components/admin/MerchantControlTable";
import { NetworkGasMatrixCard } from "../components/admin/NetworkGasMatrixCard";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-sans pb-16">
      {/* Navbar */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-zinc-950 font-bold">
              <Shield className="w-4 h-4 fill-current" />
            </span>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">Captain Platform</div>
              <div className="text-[10px] text-zinc-400 tracking-wider uppercase font-semibold">
                Super Admin & Dev Portal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
            >
              <span>Merchant Portal</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>

            <a
              href="http://localhost:3000/sandbox"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
            >
              <Terminal className="w-3 h-3 text-cyan-400" />
              <span>Simulator</span>
            </a>

            <a
              href="http://localhost:8080/swagger"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/30 transition-colors"
            >
              <span>Swagger</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Operations</h1>
          <p className="text-xs text-zinc-400">
            Real-time infrastructure monitoring, hot wallet liquidity, and merchant administration
          </p>
        </div>

        {/* 1. Platform Metrics & Emergency Switch */}
        <PlatformMetricsCard metrics={mockPlatformMetrics} />

        {/* 2. On-Chain Gas & Live Coin Price Matrix */}
        <NetworkGasMatrixCard rates={mockNetworkGasList} />

        {/* 3. Hot Wallet Gas Reserves */}
        <HotWalletGasCard wallets={mockHotWallets} />

        {/* 4. Multi-Chain Watcher Indexers */}
        <WatcherHealthCard watchers={mockWatchers} />

        {/* 5. Merchant Control Table */}
        <MerchantControlTable initialMerchants={mockMerchantsList} />
      </main>
    </div>
  );
}

