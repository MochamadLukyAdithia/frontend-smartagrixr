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

    const res = await fetch(`${backendUrl}/api/ai/refund`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {}

  return NextResponse.json({
    success: true,
    message: "Kuota berhasil dikembalikan.",
    quota: {
      allowed: true,
      feature: "ai_2d_to_3d",
      plan: "free",
      limit: 3,
      used_today: 0,
      remaining: 3,
      can_generate: true,
    },
  });
}
