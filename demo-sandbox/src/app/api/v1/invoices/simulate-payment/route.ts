import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const backendUrl = process.env.BACKEND_URL;

    // 1. If backend URL is configured, forward via server-side proxy
    if (backendUrl) {
      try {
        const backendRes = await fetch(`${backendUrl}/api/v1/invoices/simulate-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const backendData = await backendRes.json();
        return NextResponse.json(backendData, { status: backendRes.status });
      } catch {
        // Fallback to local simulation
      }
    }

    // 2. Vercel Native Simulation Response
    return NextResponse.json({
      success: true,
      message: "Payment simulated successfully. State transitioned to PAID.",
      data: {
        status: "PAID",
        received_amount: body.amount || "20.00",
        pay_amount: body.amount || "20.00",
        tx_hash: `0xsim_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        simulated: true,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to simulate payment",
        error: err instanceof Error ? err.message : "Internal error",
      },
      { status: 500 }
    );
  }
}
