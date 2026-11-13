import { NextRequest, NextResponse } from "next/server";

// In-memory registry (persistable to Vercel KV / Edge Config if configured)
// Global variable persists across warm lambda invocations
declare global {
  var __13C_REVOKED_LICENSES: Set<string> | undefined;
  var __13C_REGISTERED_CLIENTS: Map<string, any> | undefined;
}

if (!globalThis.__13C_REVOKED_LICENSES) {
  globalThis.__13C_REVOKED_LICENSES = new Set<string>();
}

if (!globalThis.__13C_REGISTERED_CLIENTS) {
  globalThis.__13C_REGISTERED_CLIENTS = new Map<string, any>();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { license_id, licensee } = body;

    if (!license_id) {
      return NextResponse.json({ status: "ERROR", message: "Missing license_id" }, { status: 400 });
    }

    // Record last ping from client
    globalThis.__13C_REGISTERED_CLIENTS!.set(license_id, {
      licensee: licensee || "Unknown",
      last_seen: new Date().toISOString(),
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "13c-gateway-agent",
    });

    // Check if Developer triggered the Kill-Switch
    if (globalThis.__13C_REVOKED_LICENSES!.has(license_id)) {
      return NextResponse.json({
        status: "REVOKED",
        reason: "Access revoked by Developer via 13C License Authority.",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: "ACTIVE",
      valid: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ status: "ERROR", message: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Developer inspects registered clients and revocations
  const clients = Array.from(globalThis.__13C_REGISTERED_CLIENTS!.entries()).map(([id, data]) => ({
    license_id: id,
    ...data,
    is_revoked: globalThis.__13C_REVOKED_LICENSES!.has(id),
  }));

  return NextResponse.json({
    active_count: clients.length,
    clients,
    revoked_count: globalThis.__13C_REVOKED_LICENSES!.size,
  });
}
