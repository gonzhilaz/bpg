"use client";

import React, { useState } from "react";
import { Key, Copy, Check, Eye, EyeOff } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";

interface Props {
  apiKey: string;
  secretKey: string;
}

export function ApiKeyCard({ apiKey, secretKey }: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  const handleCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-zinc-100">API Credentials</h2>
          <Tooltip content="Use X-API-KEY in HTTP request headers to authenticate." />
        </div>
      </div>

      <div className="space-y-3 text-xs">
        {/* API Key */}
        <div className="space-y-1">
          <span className="text-zinc-400 font-medium">Public API Key</span>
          <div className="flex items-center justify-between bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-3 py-2">
            <span className="font-mono text-zinc-200 select-all truncate">{apiKey}</span>
            <button
              type="button"
              onClick={() => handleCopy(apiKey, "api")}
              className="ml-2 inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200"
            >
              {copiedKey === "api" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === "api" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Secret Key */}
        <div className="space-y-1">
          <span className="text-zinc-400 font-medium">Webhook Secret</span>
          <div className="flex items-center justify-between bg-zinc-800/60 border border-zinc-700/60 rounded-xl px-3 py-2">
            <span className="font-mono text-zinc-200 truncate">
              {showSecret ? secretKey : "••••••••••••••••••••••••••••••••"}
            </span>
            <div className="flex items-center gap-2 ml-2">
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="text-zinc-400 hover:text-zinc-200"
                aria-label="Toggle secret visibility"
              >
                {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => handleCopy(secretKey, "secret")}
                className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200"
              >
                {copiedKey === "secret" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === "secret" ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

