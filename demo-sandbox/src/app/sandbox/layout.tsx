import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sandbox Simulator",
};

export default function SandboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
