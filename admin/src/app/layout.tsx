import type { Metadata } from "next";
import "./globals.css";
import { AdminAppProviders } from "../components/layout/AdminAppProviders";
import { AdminShell } from "../components/auth/AdminShell";

export const metadata: Metadata = {
  title: {
    default: "13CPG | Platform Super Admin",
    template: "%s | 13CPG Admin",
  },
  description:
    "13CPG Platform Administration - Node monitoring, merchant management, and system operations.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
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
