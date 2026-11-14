"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Lock,
  Mail,
  Store,
  Key,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { getEnvUrl } from "../../utils/env";
import { AuthShowcasePanel } from "../../components/auth/AuthShowcasePanel";
import { PasswordStrengthMeter } from "../../components/auth/PasswordStrengthMeter";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reveal Once credentials
  const [credentials, setCredentials] = useState<{
    apiKey: string;
    secretKey: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!agreeTerms) {
      setError("You must accept the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${getEnvUrl.api()}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
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

  const copyToClipboard = (text: string, type: "key" | "secret") => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const isPasswordMatch = password && confirmPassword && password === confirmPassword;

  return (
    <main className="min-h-screen bg-[#0B0E14] text-zinc-100 flex flex-col lg:grid lg:grid-cols-12 font-sans">
      {/* Left OxaPay Showcase Panel */}
      <div className="lg:col-span-5 hidden lg:flex">
        <AuthShowcasePanel mode="register" />
      </div>

      {/* Right Form Container */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 flex items-center justify-center text-zinc-950 font-bold shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white font-mono">13C GATEWAY</h1>
            <p className="text-xs text-zinc-400">Accept Global Crypto Payments</p>
          </div>

          {/* Form Header */}
          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-white">Create Merchant Account</h2>
            <p className="text-xs text-zinc-400">
              Start accepting automated multi-chain crypto payments with flat 0.4% fees.
            </p>
          </div>

          {/* Reveal Once Card or Registration Form */}
          {credentials ? (
            <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl shadow-amber-500/10 space-y-5 animate-in fade-in duration-300">
              <div className="flex items-center gap-2.5 text-amber-400">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div className="text-sm font-bold">Important: Save Your Production Keys Now!</div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                For cryptographic security, your raw API key is hashed and{" "}
                <strong className="text-zinc-200">will never be displayed again</strong>. Please copy and
                store it securely in your password manager or backend environment variables.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 font-sans block mb-1">Production API Key</span>
                  <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
                    <span className="text-cyan-400 flex-1 truncate">{credentials.apiKey}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(credentials.apiKey, "key")}
                      className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-400 font-sans block mb-1">Webhook Secret Key</span>
                  <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5">
                    <span className="text-zinc-300 flex-1 truncate">{credentials.secretKey}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(credentials.secretKey, "secret")}
                      className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {copiedSecret ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Link
                href="/"
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-zinc-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>I Have Saved My Keys • Continue to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-zinc-300 mb-1.5 font-medium">Store / Company Name</label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Crypto Merchants Inc."
                      className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1.5 font-medium">Business Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="merchant@company.com"
                      className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1.5 font-medium">Create Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && <PasswordStrengthMeter password={password} />}
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1.5 font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors"
                      required
                    />
                    {isPasswordMatch && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer text-[11px] text-zinc-400 hover:text-zinc-300 select-none leading-relaxed">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-3.5 h-3.5 mt-0.5 rounded bg-zinc-950 border-zinc-800 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                    <span>
                      I agree to the <span className="text-cyan-400 hover:underline">Terms of Service</span> and{" "}
                      <span className="text-cyan-400 hover:underline">Privacy Policy</span>.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-zinc-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? "Generating Merchant Keys..." : "Create Merchant Account"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="pt-3 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
                Already registered?{" "}
                <Link href="/login" className="text-cyan-400 hover:underline font-medium">
                  Sign in here
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted with SHA-256 Key Derivation & AES-256-GCM</span>
          </div>
        </div>
      </div>
    </main>
  );
}
