"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

export function MerchantAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("13c_token");
    if (!token) {
      setAuthorized(false);
      router.replace("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (authorized === null || !authorized) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center text-zinc-400 space-y-3 font-sans">
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
          <Zap className="w-5 h-5 animate-pulse" />
        </div>
        <div className="text-xs font-semibold tracking-wider uppercase text-zinc-300">
          Verifying Merchant Session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
