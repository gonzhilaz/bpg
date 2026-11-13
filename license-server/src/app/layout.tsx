import "./globals.css";

export const metadata = {
  title: "13C License Authority & Kill-Switch Controller",
  description: "Enterprise software licensing dashboard for 13C Payment Gateway",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0B0E14] text-zinc-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
