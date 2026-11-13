"use client";

import React from "react";
import { Activity } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import { useLanguage } from "../../context/LanguageContext";
import { WatcherHealthCard } from "../../components/admin/WatcherHealthCard";
import { RpcManagerCard } from "../../components/admin/RpcManagerCard";
import { Tooltip } from "../../components/ui/Tooltip";

export default function WatchersPage() {
  const { watchers } = useAdmin();
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>{t("multiChainWatchers")}</span>
            <Tooltip content="Independent worker processes and multi-chain RPC providers monitoring blockchain deposit transactions." />
          </h1>
          <p className="text-xs text-zinc-400">
            Node RPC health, block scanning latency, and dynamic RPC management.
          </p>
        </div>
      </div>

      {/* Main Watchers Grid */}
      <WatcherHealthCard watchers={watchers} />

      {/* Dynamic RPC Management Suite */}
      <RpcManagerCard />
    </div>
  );
}
