import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://backend-smartagrixr-production.up.railway.app";
  const authHeader = req.headers.get("authorization");
  const feature = req.nextUrl.searchParams.get("feature") || "ai_2d_to_3d";

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (authHeader) headers.Authorization = authHeader;

    const res = await fetch(`${backendUrl}/api/ai/quota?feature=${encodeURIComponent(feature)}`, { headers });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  // Fallback Free: 3x per hari sesuai AiQuotaService di smartagrixr-dev
  return NextResponse.json({
    allowed: true,
    feature,
    plan: "free",
    limit: 3,
    used_today: 0,
    remaining: 3,
    can_generate: true,
    resets_at: new Date(Date.now() + 86400000).toISOString(),
  });
}
