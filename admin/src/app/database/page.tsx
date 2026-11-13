"use client";

import React from "react";
import { Database, HardDrive, Shield, Layers, FileCode, Server } from "lucide-react";
import { DatabaseTelemetryGrid } from "../../components/admin/database/DatabaseTelemetryGrid";
import { TableStorageInspector } from "../../components/admin/database/TableStorageInspector";
import { DatabaseMaintenanceOps } from "../../components/admin/database/DatabaseMaintenanceOps";
import { DatabaseBackupManager } from "../../components/admin/database/DatabaseBackupManager";
import { DatabaseMigrationsCard } from "../../components/admin/database/DatabaseMigrationsCard";

export default function DatabasePage() {
  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            Database Engine & Storage Maintenance
          </h1>
          <p className="text-xs text-zinc-400">
            PostgreSQL multi-mode pool telemetry, granular table footprint audit, zero-lock pruning, and disaster recovery.
          </p>
        </div>
      </div>

      {/* 1. Live Engine & Pool Telemetry */}
      <DatabaseTelemetryGrid />

      {/* 2. Granular Table Storage & Bloat Inspector */}
      <TableStorageInspector />

      {/* 3. Vacuum Operations & Targeted Pruning Engine */}
      <DatabaseMaintenanceOps />

      {/* 4. Disaster Recovery Snapshots (pg_dump) */}
      <DatabaseBackupManager />

      {/* 5. Applied SQL Migrations & Schema Versioning */}
      <DatabaseMigrationsCard />
    </div>
  );
}
