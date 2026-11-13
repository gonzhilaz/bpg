"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, ArrowUpRight, Key, X } from "lucide-react";

export function MerchantNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [alerts, setAlerts] = useState([
    {
      id: "notif-01",
      title: "Invoice Settled",
      desc: "Order #ORD-98210 received 20.00 USDT on Polygon PoS.",
      time: "2m ago",
      href: "/invoices",
    },
    {
      id: "notif-02",
      title: "Auto-Payout Completed",
      desc: "500.00 USDT forwarded to registered Cold Wallet.",
      time: "1h ago",
      href: "/payouts",
    },
  ]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border border-zinc-700/80 transition-colors"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-zinc-300" />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 text-zinc-950 text-[9px] font-bold items-center justify-center">
              {alerts.length}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-4 z-50 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Notifications
            </span>
            {alerts.length > 0 && (
              <button
                type="button"
                onClick={() => setAlerts([])}
                className="text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {alerts.length > 0 ? (
              alerts.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block p-3 rounded-xl bg-zinc-950/80 hover:bg-zinc-800/60 border border-zinc-800/80 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {item.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-normal">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{item.desc}</p>
                </Link>
              ))
            ) : (
              <div className="p-6 text-center text-zinc-400 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <div className="text-xs font-semibold text-white">No New Notifications</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

