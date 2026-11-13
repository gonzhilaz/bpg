import type { Metadata } from "next";
import "./globals.css";
import { AdminProvider } from "../context/AdminContext";
import { AdminSidebar } from "../components/layout/AdminSidebar";
import { AdminHeader } from "../components/layout/AdminHeader";

export const metadata: Metadata = {
  title: "13C Platform Super Admin",
  description: "Dev control dashboard for 13C Crypto Payment Gateway",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#0B0E14] text-zinc-100">
        <AdminProvider>
          <div className="min-h-screen bg-[#0B0E14] text-zinc-100 flex font-sans">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
              <AdminHeader />
              <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
                {children}
              </main>
            </div>
          </div>
        </AdminProvider>
      </body>
    </html>
  );
}
