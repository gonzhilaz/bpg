import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Captain Platform Super Admin",
  description: "Dev control dashboard for Captain Crypto Payment Gateway",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#0B0E14] text-zinc-100">
        {children}
      </body>
    </html>
  );
}

