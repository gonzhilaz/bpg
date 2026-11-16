import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const backendUrl = process.env.BACKEND_URL;

  // 1. If backend URL is configured, proxy SSE stream
  if (backendUrl) {
    try {
      const backendRes = await fetch(`${backendUrl}/api/v1/invoices/${id}/events`, {
        headers: { Accept: "text/event-stream" },
      });
      if (backendRes.body) {
        return new Response(backendRes.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      }
    } catch {
      // Fallback
    }
  }

  // 2. Vercel Native SSE Stream Fallback
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const initial = JSON.stringify({
        event: "connected",
        invoice_id: id,
        status: "PENDING",
        received_amount: "0.00",
        pay_amount: "20.00",
      });
      controller.enqueue(encoder.encode(`event: invoice\ndata: ${initial}\n\n`));

      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          clearInterval(interval);
        }
      }, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
