import React from "react";
import { EnvironmentProvider } from "../../context/EnvironmentContext";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { SandboxBanner } from "../../components/layout/SandboxBanner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EnvironmentProvider>
      <div className="min-h-screen bg-[#0B0E14] text-zinc-100 flex font-sans">
        {/* Sidebar Nav */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <SandboxBanner />
          <Header />
          <main className="flex-1 p-3 md:p-6 max-w-[1600px] w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </EnvironmentProvider>
  );
}

