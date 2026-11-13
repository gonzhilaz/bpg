import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { license_id, action } = await req.json();

    if (!license_id) {
      return NextResponse.json({ error: "license_id required" }, { status: 400 });
    }

    if (!globalThis.__13C_REVOKED_LICENSES) {
      globalThis.__13C_REVOKED_LICENSES = new Set<string>();
    }

    if (action === "REVOKE") {
      globalThis.__13C_REVOKED_LICENSES.add(license_id);
    } else {
      globalThis.__13C_REVOKED_LICENSES.delete(license_id);
    }

    return NextResponse.json({
      success: true,
      license_id,
      is_revoked: globalThis.__13C_REVOKED_LICENSES.has(license_id),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
