import { NextRequest, NextResponse } from "next/server";

const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL || "http://localhost:8080";

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, await params);
}

async function handleProxy(request: NextRequest, { path }: { path: string[] }) {
  const targetSubPath = path.join("/");
  const targetUrl = new URL(`/api/v1/${targetSubPath}`, BACKEND_INTERNAL_URL);

  // Preserve query params
  request.nextUrl.searchParams.forEach((val, key) => {
    targetUrl.searchParams.set(key, val);
  });

  const headers = new Headers();
  request.headers.forEach((val, key) => {
    // Exclude host and origin to prevent CORS leak
    if (!["host", "connection", "content-length"].includes(key.toLowerCase())) {
      headers.set(key, val);
    }
  });

  try {
    const body = request.method !== "GET" && request.method !== "HEAD" 
      ? await request.text() 
      : undefined;

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body,
    });

    const resData = await response.text();
    return new NextResponse(resData, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
        // Anti-inspection security headers
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal Gateway Proxy Error",
        error: err instanceof Error ? err.message : "Connection refused",
      },
      { status: 502 }
    );
  }
}

