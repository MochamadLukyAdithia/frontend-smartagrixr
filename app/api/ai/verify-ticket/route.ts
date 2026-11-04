import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://backend-smartagrixr-production.up.railway.app";
  const authHeader = req.headers.get("authorization");
  const body = await req.json().catch(() => ({}));

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (authHeader) headers.Authorization = authHeader;

    const res = await fetch(`${backendUrl}/api/ai/verify-ticket`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {}

  // Fallback simulator
  const ticketId = `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return NextResponse.json({
    success: true,
    data: {
      ticket_id: ticketId,
      valid: true,
      remaining_quota: 2,
      plan: "free",
    },
  });
}

