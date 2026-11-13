"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Flame, Activity, CheckCircle2, X, ExternalLink, AlertTriangle } from "lucide-react";
import { useAdmin } from "../../context/AdminContext";

export function AdminNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { hotWallets } = useAdmin();

  const [alerts, setAlerts] = useState([
    {
      id: "alert-gas-polygon",
      severity: "CRITICAL" as const,
      title: "Polygon Gas Liquidity Low",
      desc: "Reserve at 18.2 POL (Min 50.0 POL). Sweeper batch transfers may stall.",
      time: "Just now",
      href: "/gas-liquidity",
      actionText: "Top Up Gas",
    },
    {
      id: "alert-watcher-sol",
      severity: "WARNING" as const,
      title: "Solana RPC Node Latency",
      desc: "Head block latency spiked to 180ms on QuickNode endpoint.",
      time: "14m ago",
      href: "/watchers",
      actionText: "Inspect Node",
    },
  ]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const clearAlerts = () => {
    setAlerts([]);
  };

  const removeAlert = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/80 transition-colors"
        title="System Notifications & Alerts"
        aria-label="System Notifications"
      >
        <Bell className="w-4 h-4 text-zinc-300" />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600 text-white text-[9px] font-bold items-center justify-center">
              {alerts.length}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-4 z-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                System Alerts
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {alerts.length} Active
              </span>
            </div>
            {alerts.length > 0 && (
              <button
                onClick={clearAlerts}
                className="text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* List of Alerts */}
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${
                    alert.severity === "CRITICAL"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      {alert.severity === "CRITICAL" ? (
                        <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>{alert.title}</span>
                    </div>
                    <button
                      onClick={(e) => removeAlert(alert.id, e)}
                      className="text-zinc-400 hover:text-white p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-300 leading-relaxed">{alert.desc}</p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-zinc-400">{alert.time}</span>
                    <Link
                      href={alert.href}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 underline"
                    >
                      <span>{alert.actionText}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-zinc-400 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <div className="text-xs font-semibold text-white">All Subsystems Nominal</div>
                <div className="text-[11px] text-zinc-500">Zero active alerts or bottlenecks.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

