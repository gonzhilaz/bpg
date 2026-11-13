import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "13C Merchant Dashboard",
  description: "Non-custodial crypto payment gateway merchant portal",
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

