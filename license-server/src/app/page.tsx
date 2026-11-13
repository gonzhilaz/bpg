"use client";

import React, { useState, useEffect } from "react";
import { Shield, Key, Power, RefreshCw, Copy, Check, Lock, Globe, Server, AlertTriangle } from "lucide-react";

export default function LicenseController() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState(false);

  // Form State
  const [licensee, setLicensee] = useState("Captain Client");
  const [domain, setDomain] = useState("*");
  const [tier, setTier] = useState<"ENTERPRISE" | "COMMERCIAL" | "TRIAL">("ENTERPRISE");
  const [durationDays, setDurationDays] = useState("365");

  // Output
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Clients Table
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "developer-root" || passcode.length >= 8) {
      setIsAuthenticated(true);
      setAuthError(false);
      fetchClients();
    } else {
      setAuthError(true);
    }
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/verify");
      const data = await res.json();
      if (data.clients) {
        setClients(data.clients);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/license/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licensee, domain, tier, durationDays }),
      });
      const data = await res.json();
      if (data.token) {
        setGeneratedToken(data.token);
      }
    } catch (err: any) {
      alert("Failed to generate: " + err.message);
    }
  };

  const handleToggleRevoke = async (licenseId: string, currentlyRevoked: boolean) => {
    const action = currentlyRevoked ? "RESTORE" : "REVOKE";
    const confirmMsg = currentlyRevoked
      ? `Restore system access for license ${licenseId}?`
      : `TRIGGER KILL-SWITCH: Are you sure you want to completely LOCK and HALT the client's gateway?`;

    if (!confirm(confirmMsg)) return;

    try {
      await fetch("/api/license/toggle-revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license_id: licenseId, action }),
      });
      fetchClients();
    } catch (err: any) {
      alert("Action failed: " + err.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#0B0E14]">
        <div className="w-full max-w-sm bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">License Authority</h1>
              <p className="text-[11px] text-zinc-400">Developer Master Access</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3 pt-2 text-xs">
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Developer Passcode</label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="developer-root"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
              />
              {authError && <p className="text-[11px] text-rose-400 mt-1">Invalid passcode</p>}
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold transition-colors"
            >
              Sign In to Controller
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0E14] text-zinc-100 p-4 sm:p-8 space-y-6 max-w-5xl mx-auto font-sans text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">13C Software License Authority</h1>
            <p className="text-[11px] text-zinc-400">Ed25519 Cryptographic Signer & Remote Kill-Switch Controller</p>
          </div>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-3 py-1.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/50"
        >
          Lock Console
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Generator Form */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
            <Key className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Issue Client License</h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="text-zinc-400 font-medium block mb-1">Licensee / Client Name</label>
              <input
                type="text"
                required
                value={licensee}
                onChange={(e) => setLicensee(e.target.value)}
                placeholder="e.g. Captain Client"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 font-medium block mb-1">Allowed Domain</label>
                <input
                  type="text"
                  required
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="* or gateway.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-medium block mb-1">Tier</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="ENTERPRISE">Enterprise (Full)</option>
                  <option value="COMMERCIAL">Commercial Standard</option>
                  <option value="TRIAL">Trial 30 Days</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-zinc-400 font-medium block mb-1">Duration (Days)</label>
              <input
                type="number"
                min="1"
                required
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold transition-colors"
            >
              Sign & Generate Token
            </button>
          </form>

          {/* Generated Token Box */}
          {generatedToken && (
            <div className="p-3 rounded-xl bg-zinc-950 border border-cyan-500/30 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Signed Token</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedToken)}
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="font-mono text-[10px] text-zinc-400 break-all select-all line-clamp-3">
                {generatedToken}
              </p>
            </div>
          )}
        </div>

        {/* Remote Kill-Switch Controller */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Power className="w-4 h-4 text-rose-400" />
                <h2 className="text-sm font-bold text-white">Remote Kill-Switch Registry</h2>
              </div>
              <button
                onClick={fetchClients}
                className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white"
                title="Refresh"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <p className="text-zinc-400 mt-2 mb-3">
              Deployments periodically ping this heartbeat endpoint. Toggling Revoke instantly freezes the client&apos;s
              gateway on its next check.
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto font-mono">
              {clients.length === 0 ? (
                <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 text-center text-zinc-500">
                  No active heartbeats recorded yet. Client pings will register here automatically.
                </div>
              ) : (
                clients.map((c) => (
                  <div
                    key={c.license_id}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      c.is_revoked ? "bg-rose-500/10 border-rose-500/30" : "bg-zinc-950/70 border-zinc-800"
                    }`}
                  >
                    <div>
                      <div className="text-white font-sans font-bold flex items-center gap-1.5">
                        <span>{c.licensee}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            c.is_revoked ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                          }`}
                        >
                          {c.is_revoked ? "REVOKED" : "ACTIVE"}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate max-w-[200px]">{c.license_id}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleRevoke(c.license_id, c.is_revoked)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        c.is_revoked
                          ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
                          : "bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {c.is_revoked ? "Restore" : "Kill Switch"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Kill-Switch Rule:</strong> Once Revoked, the client&apos;s gateway halts all checkout creation and payment sweeps with HTTP 402 until you click Restore.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
