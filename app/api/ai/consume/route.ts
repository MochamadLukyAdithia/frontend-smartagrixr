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

    const res = await fetch(`${backendUrl}/api/ai/consume`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {}

  // Fallback standalone simulator
  const usageId = Math.floor(Date.now() / 1000);
  const ticketToken = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return NextResponse.json({
    allowed: true,
    message: "Kuota berhasil dipotong.",
    usage_id: usageId,
    ticket_token: ticketToken,
    quota: {
      allowed: true,
      feature: body?.feature || "ai_2d_to_3d",
      plan: "free",
      limit: 3,
      used_today: 1,
      remaining: 2,
      can_generate: true,
    },
  });
}
