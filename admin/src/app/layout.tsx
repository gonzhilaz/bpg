import type { Metadata } from "next";
import "./globals.css";
import { AdminAppProviders } from "../components/layout/AdminAppProviders";
import { AdminShell } from "../components/auth/AdminShell";

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
        <AdminAppProviders>
          <AdminShell>{children}</AdminShell>
        </AdminAppProviders>
      </body>
    </html>
  );
}
