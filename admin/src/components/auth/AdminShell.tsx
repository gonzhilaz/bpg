"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "../layout/AdminSidebar";
import { AdminHeader } from "../layout/AdminHeader";
import { Shield } from "lucide-react";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    // Check root admin session
    const session = sessionStorage.getItem("13c_admin_session");
    if (!session && !isLoginPage) {
      setIsAuthenticated(false);
      router.replace("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [pathname, isLoginPage, router]);

  // If on login page, render full screen without sidebar/header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading / verifying auth state
  if (isAuthenticated === null || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center text-zinc-400 space-y-3 font-sans">
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
          <Shield className="w-5 h-5 animate-pulse" />
        </div>
        <div className="text-xs font-semibold tracking-wider uppercase text-zinc-300">
          Verifying Root Admin Credentials...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-zinc-100 flex font-sans overflow-x-hidden max-w-full">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden max-w-full">
        <AdminHeader />
        <main className="flex-1 p-3 md:p-6 max-w-[1600px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

