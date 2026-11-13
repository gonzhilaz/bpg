"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Lock, Mail, Store, Key, Copy, Check, AlertTriangle, ArrowRight } from "lucide-react";
import { getEnvUrl } from "../../utils/env";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reveal Once credentials
  const [credentials, setCredentials] = useState<{
    apiKey: string;
    secretKey: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${getEnvUrl.api()}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }

      setCredentials({
        apiKey: data.data.raw_api_key,
        secretKey: data.data.raw_secret_key,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0B0E14] text-zinc-100 flex flex-col justify-center items-center px-4 py-8 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-cyan-500/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Become a Merchant</h1>
          <p className="text-xs text-zinc-400">Accept non-custodial crypto payments in seconds</p>
        </div>

        {/* Reveal Once Modal / Card */}
        {credentials ? (
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl shadow-amber-500/10 space-y-5">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div className="text-xs font-semibold">Save Your API Key Now!</div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              For security, your raw API key is hashed and{" "}
              <strong className="text-zinc-200">will never be shown again</strong>. Please copy and
              store it securely in your password manager or backend environment variables.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 font-sans block mb-1">Production API Key</span>
                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
                  <span className="text-cyan-400 flex-1 truncate">{credentials.apiKey}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(credentials.apiKey)}
                    className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-sans block mb-1">Webhook Secret</span>
                <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
                  <span className="text-zinc-300 flex-1 truncate">{credentials.secretKey}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(credentials.secretKey)}
                    className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <span>I Have Saved It • Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Store / Company Name</label>
                <div className="relative">
                  <Store className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Online Store"
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Business Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@store.com"
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Password (min 6 characters)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-zinc-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{loading ? "Generating Credentials..." : "Generate API Key & Register"}</span>
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-zinc-500 border-t border-zinc-800/80">
              <span>Already registered? </span>
              <Link href="/login" className="text-cyan-400 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

