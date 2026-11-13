"use client";

import React from "react";
import { Database, HardDrive, Activity, Zap, Cpu, Server, CheckCircle2 } from "lucide-react";

export function DatabaseTelemetryGrid() {
  const telemetry = {
    driver: "PostgreSQL 16.2 / Multi-Mode SQLite",
    status: "HEALTHY",
    uptime: "28d 14h 22m",
    connectionPool: {
      max: 100,
      active: 6,
      idle: 14,
      waiting: 0,
    },
    performance: {
      cacheHitRatio: "99.85%",
      walThroughput: "1.4 MB/s",
      avgQueryLatency: "1.4 ms",
      tps: "42.8 tx/s",
    },
    storage: {
      total: "48.2 MB",
      data: "32.6 MB",
      indexes: "15.6 MB",
    },
  };

  const poolPercent = Math.round(
    ((telemetry.connectionPool.active + telemetry.connectionPool.idle) / telemetry.connectionPool.max) * 100
  );

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Engine & Connection Pool Telemetry
          </h2>
          <span className="text-[10px] text-zinc-500 font-mono">v16.2 Enterprise</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Synchronous Multi-Mode
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">Uptime: {telemetry.uptime}</span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Connection Pool */}
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
          <div className="text-[11px] text-zinc-400 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              Connection Pool
            </span>
            <span className="text-zinc-500 font-mono">{poolPercent}%</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {telemetry.connectionPool.active} <span className="text-xs text-zinc-500 font-normal">in-use</span> / {telemetry.connectionPool.idle} <span className="text-xs text-zinc-500 font-normal">idle</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden flex">
            <div
              className="bg-cyan-400 h-full"
              style={{ width: `${(telemetry.connectionPool.active / telemetry.connectionPool.max) * 100}%` }}
            />
            <div
              className="bg-zinc-600 h-full"
              style={{ width: `${(telemetry.connectionPool.idle / telemetry.connectionPool.max) * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-zinc-500">Max limit: 100 • Queue: 0</div>
        </div>

        {/* Cache Hit Ratio */}
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
          <div className="text-[11px] text-zinc-400 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Buffer Cache Hit
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {telemetry.performance.cacheHitRatio}
          </div>
          <p className="text-[10px] text-zinc-500">Shared buffers caching queries in RAM.</p>
        </div>

        {/* Query Latency */}
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
          <div className="text-[11px] text-zinc-400 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Avg Latency
            </span>
            <span className="text-zinc-500 font-mono">{telemetry.performance.tps}</span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {telemetry.performance.avgQueryLatency}
          </div>
          <p className="text-[10px] text-zinc-500">P99 query time: 3.2ms • 0 slow locks.</p>
        </div>

        {/* Storage Footprint */}
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
          <div className="text-[11px] text-zinc-400 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              Storage Footprint
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {telemetry.storage.total}
          </div>
          <p className="text-[10px] text-zinc-500">
            Data: {telemetry.storage.data} • Index: {telemetry.storage.indexes}
          </p>
        </div>
      </div>
    </div>
  );
}

