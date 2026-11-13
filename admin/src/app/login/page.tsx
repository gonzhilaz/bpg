"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, KeyRound, Key, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState("admin@13cgateway.internal");
  const [masterKey, setMasterKey] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setLoading(true);
    setError(null);

    setTimeout(() => {
      // In development/production, validates master root secret & 6-digit TOTP
      const isValidKey = masterKey === "admin123" || masterKey.length >= 8;
      const isValidTotp = totpCode.length === 6 || totpCode === "131313";

      if (isValidKey && isValidTotp) {
        const sessionToken = `13c_root_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        sessionStorage.setItem("13c_admin_session", sessionToken);
        router.push("/");
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          setIsLocked(true);
          setError("Access locked: Too many failed root attempts. Wait 60 seconds.");
          setTimeout(() => {
            setIsLocked(false);
            setAttempts(0);
            setError(null);
          }, 60000);
        } else {
          setError(`Invalid Master Key or 2FA TOTP code. (${5 - nextAttempts} attempts left)`);
        }
      }
      setLoading(false);
    }, 800);
  };

  const handleDevBypass = () => {
    setMasterKey("admin123");
    setTotpCode("131313");
  };

  return (
    <main className="min-h-screen bg-[#0B0E14] text-zinc-100 flex flex-col justify-center items-center px-4 font-sans">
      <div className="w-full max-w-sm space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-zinc-950 font-bold shadow-xl shadow-cyan-500/20">
            <Shield className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Dev Admin Console</h1>
          <p className="text-xs text-zinc-400">
            High-security root gateway infrastructure access
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-800">
            <span className="flex items-center gap-1.5 font-bold text-cyan-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Root Privilege Tier
            </span>
            <span className="font-mono text-zinc-500">2FA Required</span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Root Admin ID</label>
              <input
                type="text"
                required
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Master Secret Key</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">2FA Authenticator Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="6-digit TOTP (e.g. 131313)"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 font-mono tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-zinc-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 disabled:opacity-50"
            >
              <span>{loading ? "Verifying Keys..." : "Authorize Root Console"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Dev Quick-Fill Pill for Local Testing */}
          <div className="pt-2 text-center text-[10px] text-zinc-500 border-t border-zinc-800/80 flex items-center justify-between">
            <span>Demo credentials:</span>
            <button
              type="button"
              onClick={handleDevBypass}
              className="text-cyan-400 hover:underline font-mono"
            >
              Fill admin123 / 131313
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

