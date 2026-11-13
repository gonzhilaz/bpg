"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Wallet, CheckCircle2, Flame, Layers } from "lucide-react";
import { useEnvironment } from "../../../context/EnvironmentContext";
import { useLanguage } from "../../../context/LanguageContext";
import { PayoutsTable } from "../../../components/dashboard/PayoutsTable";
import { StatTile } from "../../../components/ui/StatTile";
import { Tooltip } from "../../../components/ui/Tooltip";

export default function PayoutsPage() {
  const { mode, payouts } = useEnvironment();
  const { t } = useLanguage();

  const totalSettled = mode === "LIVE" ? "$500.00" : "$20.00";
  const completedCount = payouts.filter((p) => p.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{t("payouts")}</span>
            <Tooltip content="Non-custodial automated sweeping records directly forwarded from deposit addresses to your cold wallets." />
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Blockchain payout transactions and settlement verification.
          </p>
        </div>

        <Link
          href="/wallets"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors self-start md:self-auto"
        >
          <Wallet className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cold Wallets</span>
        </Link>
      </div>

      {/* Settlement Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatTile
          label="Total Settled"
          value={totalSettled}
          icon={Layers}
          tooltip="Cumulative value of all crypto payments swept to destination cold wallets."
          trend={`${completedCount} Swept`}
          trendUp={true}
        />

        <StatTile
          label="Settlement Engine"
          value="Automated"
          icon={CheckCircle2}
          tooltip="Automated sweeper worker forwards funds instantly once confirmation threshold is reached."
          trend="Non-Custodial"
          trendUp={true}
        />

        <StatTile
          label="Gas Policy"
          value="Configured"
          icon={Flame}
          tooltip="Defines whether merchant or customer covers on-chain sweeping gas costs."
          trend="Auto"
          trendUp={true}
        />
      </div>

      {/* Payouts Table */}
      <PayoutsTable payouts={payouts} />
    </div>
  );
}
