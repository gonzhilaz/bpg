"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, KeyRound, ArrowLeft } from "lucide-react";
import { getEnvUrl } from "../../utils/env";

export default function LoginPage() {
  const [email, setEmail] = useState("merchant@company.com");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [require2FA, setRequire2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Attempt API login
      const payload: { email: string; password: string; two_factor_code?: string } = {
        email,
        password,
      };
      if (require2FA && twoFactorCode) {
        payload.two_factor_code = twoFactorCode.trim();
      }

      const res = await fetch(`${getEnvUrl.api()}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        // Check if 2FA challenge is requested
        if (data.data?.require_2fa) {
          setRequire2FA(true);
          setLoading(false);
          return;
        }

        if (data.data?.token) {
          localStorage.setItem("13c_token", data.data.token);
        } else {
          localStorage.setItem("13c_token", `tok_${Date.now()}`);
        }
        window.location.href = "/";
        return;
      } else if (data?.message) {
        setError(data.message);
        setLoading(false);
        return;
      }
    } catch {
      // Backend offline / network fallback for demo mode
    }

    // 2. Demo fallback credential verification
    if (password.length >= 6) {
      if (require2FA && twoFactorCode.length !== 6) {
        setError("Please enter a valid 6-digit TOTP code.");
        setLoading(false);
        return;
      }
      localStorage.setItem("13c_token", `demo_tok_${Date.now()}`);
      window.location.href = "/";
    } else {
      setError("Password must be at least 6 characters.");
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail("merchant@company.com");
    setPassword("password123");
    setRequire2FA(false);
    setTwoFactorCode("");
    setError(null);
  };

  return (
    <main className="min-h-screen bg-[#0B0E14] text-zinc-100 flex flex-col justify-center items-center px-4 font-sans">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-cyan-500/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Merchant Portal</h1>
          <p className="text-xs text-zinc-400">Access your crypto payment gateway dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {!require2FA ? (
            /* Step 1: Email & Password */
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Business Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="merchant@company.com"
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-zinc-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? "Authenticating..." : "Sign In to Dashboard"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            /* Step 2: 2FA TOTP Code Challenge */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 space-y-1">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold text-xs">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>Two-Factor Authentication</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Enter the 6-digit code from your Google Authenticator or Authy app for{" "}
                  <strong className="text-zinc-200">{email}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">6-Digit TOTP Code</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    autoFocus
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 font-mono tracking-widest text-center text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={loading || twoFactorCode.length !== 6}
                  className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-zinc-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? "Verifying TOTP..." : "Verify & Sign In"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRequire2FA(false);
                    setTwoFactorCode("");
                    setError(null);
                  }}
                  className="w-full py-2 px-3 text-[11px] text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Email & Password</span>
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 text-center text-[10px] text-zinc-500 border-t border-zinc-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Fill demo credentials
            </button>
            <Link href="/register" className="text-zinc-400 hover:text-white">
              Create account
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Non-Custodial Payment Protocol</span>
        </div>
      </div>
    </main>
  );
}
