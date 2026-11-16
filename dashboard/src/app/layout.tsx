import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "../components/layout/AppProviders";

export const metadata: Metadata = {
  title: {
    default: "13CPG | Merchant Dashboard",
    template: "%s | 13CPG Dashboard",
  },
  description:
    "13CPG Merchant Portal - Real-time settlements, invoice management, and non-custodial crypto payments.",
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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

