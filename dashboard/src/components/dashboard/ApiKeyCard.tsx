"use client";

import React, { useState } from "react";
import { Key, Copy, Check, Eye, EyeOff } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";
import { IconButton } from "../ui/IconButton";

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
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Active Credentials</h2>
          <Tooltip content="Use X-API-KEY in HTTP request headers to authenticate with 13C Gateway." />
        </div>
      </div>

      <div className="space-y-2.5 text-xs">
        {/* API Key */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium">API Key</span>
            <Tooltip content="Live production authentication credential for your store." />
          </div>
          <div className="flex items-center justify-between bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-1.5">
            <span className="font-mono text-xs text-zinc-200 select-all truncate">{apiKey}</span>
            <IconButton
              icon={copiedKey === "api" ? Check : Copy}
              tooltip={copiedKey === "api" ? "Copied" : "Copy Key"}
              onClick={() => handleCopy(apiKey, "api")}
              size="xs"
              variant="ghost"
            />
          </div>
        </div>

        {/* Secret Key */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium">Signing Secret</span>
            <Tooltip content="HMAC-SHA256 signature key to verify webhook callbacks." />
          </div>
          <div className="flex items-center justify-between bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-1.5">
            <span className="font-mono text-xs text-zinc-200 truncate">
              {showSecret ? secretKey : "••••••••••••••••••••••••••••••••"}
            </span>
            <div className="flex items-center gap-1 ml-2">
              <IconButton
                icon={showSecret ? EyeOff : Eye}
                tooltip={showSecret ? "Hide Secret" : "Reveal Secret"}
                onClick={() => setShowSecret(!showSecret)}
                size="xs"
                variant="ghost"
              />
              <IconButton
                icon={copiedKey === "secret" ? Check : Copy}
                tooltip={copiedKey === "secret" ? "Copied" : "Copy Secret"}
                onClick={() => handleCopy(secretKey, "secret")}
                size="xs"
                variant="ghost"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
