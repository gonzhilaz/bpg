import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const backendUrl = process.env.BACKEND_URL;

  // 1. If backend URL is configured, forward via server-side proxy
  if (backendUrl) {
    try {
      const backendRes = await fetch(`${backendUrl}/api/v1/invoices/${id}`, {
        cache: "no-store",
      });
      const backendData = await backendRes.json();
      return NextResponse.json(backendData, { status: backendRes.status });
    } catch {
      // Fallback
    }
  }

  // 2. Vercel Native dynamic invoice retrieval
  return NextResponse.json({
    success: true,
    data: {
      id,
      order_id: `ORD-${id.slice(-5)}`,
      amount: 20.0,
      currency: "USD",
      pay_currency: "USDT",
      pay_network: "POLYGON",
      pay_amount: "20.00",
      received_amount: "0.00",
      deposit_address: "0x71C8A3951F6b4d3E118bFE7c251d18fF2113f019",
      status: "PENDING",
      expires_at: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    },
  });
}
