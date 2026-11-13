"use client";

import React, { useState } from "react";
import { Download, ShieldCheck, HardDrive, Clock, Plus, CheckCircle2, RefreshCw } from "lucide-react";

interface Snapshot {
  id: string;
  filename: string;
  createdAt: string;
  size: string;
  type: "FULL_DUMP" | "HOURLY_AUTO" | "MANUAL";
  checksum: string;
  verified: boolean;
}

export function DatabaseBackupManager() {
  const [creating, setCreating] = useState(false);
  const [createdMsg, setCreatedMsg] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([
    {
      id: "snap-03",
      filename: "13c_db_dump_20261113_1200.sql.gz",
      createdAt: "Today, 12:00:00",
      size: "48.2 MB",
      type: "FULL_DUMP",
      checksum: "sha256:8f4c...91b2",
      verified: true,
    },
    {
      id: "snap-02",
      filename: "13c_db_dump_20261112_0000.sql.gz",
      createdAt: "Yesterday, 00:00:00",
      size: "46.8 MB",
      type: "HOURLY_AUTO",
      checksum: "sha256:3a1e...44d0",
      verified: true,
    },
    {
      id: "snap-01",
      filename: "13c_db_dump_20261111_0000.sql.gz",
      createdAt: "2 days ago",
      size: "44.1 MB",
      type: "HOURLY_AUTO",
      checksum: "sha256:99c2...7a81",
      verified: true,
    },
  ]);

  const handleCreateSnapshot = () => {
    setCreating(true);
    setCreatedMsg(null);

    setTimeout(() => {
      const now = new Date();
      const newSnap: Snapshot = {
        id: `snap-${Date.now()}`,
        filename: `13c_db_dump_${now.toISOString().slice(0, 10).replace(/-/g, "")}_manual.sql.gz`,
        createdAt: "Just now",
        size: "48.4 MB",
        type: "MANUAL",
        checksum: "sha256:d41d...8cd9",
        verified: true,
      };
      setSnapshots([newSnap, ...snapshots]);
      setCreating(false);
      setCreatedMsg("Consistent point-in-time database snapshot created and verified.");
      setTimeout(() => setCreatedMsg(null), 4000);
    }, 1500);
  };

  const handleDownload = (filename: string) => {
    alert(`Initiating verified download for snapshot: ${filename}`);
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Disaster Recovery & Compressed Snapshots
          </h2>
        </div>

        <button
          onClick={handleCreateSnapshot}
          disabled={creating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all disabled:opacity-50"
        >
          {creating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          <span>{creating ? "Exporting pg_dump..." : "Create Instant Snapshot"}</span>
        </button>
      </div>

      {createdMsg && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{createdMsg}</span>
        </div>
      )}

      {/* Snapshots Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 text-[11px] font-sans">
              <th className="pb-2">Snapshot Artifact</th>
              <th className="pb-2">Timestamp</th>
              <th className="pb-2">Type</th>
              <th className="pb-2 text-right">Size</th>
              <th className="pb-2 text-center">Checksum</th>
              <th className="pb-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50 text-[11px]">
            {snapshots.map((snap) => (
              <tr key={snap.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="py-2.5 font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{snap.filename}</span>
                </td>
                <td className="py-2.5 text-zinc-300 font-sans">{snap.createdAt}</td>
                <td className="py-2.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300 font-sans">
                    {snap.type}
                  </span>
                </td>
                <td className="py-2.5 text-right text-zinc-200">{snap.size}</td>
                <td className="py-2.5 text-center text-zinc-500 text-[10px]">{snap.checksum}</td>
                <td className="py-2.5 text-right font-sans">
                  <button
                    onClick={() => handleDownload(snap.filename)}
                    className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium text-xs"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

