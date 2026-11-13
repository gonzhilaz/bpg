import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { signLicense } from "@/lib/keys";

export async function POST(req: NextRequest) {
  try {
    const { licensee, domain, tier, durationDays } = await req.json();

    if (!licensee) {
      return NextResponse.json({ error: "Licensee name required" }, { status: 400 });
    }

    const days = parseInt(durationDays) || 365;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const licenseId = `13C-LIC-${crypto.randomUUID()}`;
    const payload = {
      license_id: licenseId,
      licensee: licensee.trim(),
      domain: domain ? domain.trim() : "*",
      tier: tier || "ENTERPRISE",
      issued_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      heartbeat_url: process.env.NEXT_PUBLIC_VERIFY_URL || "https://13c-license-server.vercel.app/api/verify",
    };

    const token = signLicense(payload as any);

    return NextResponse.json({
      success: true,
      license_id: licenseId,
      token,
      payload,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
