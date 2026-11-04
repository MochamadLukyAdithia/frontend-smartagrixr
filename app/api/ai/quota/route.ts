import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://backend-smartagrixr-production.up.railway.app";
  const authHeader = req.headers.get("authorization");

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (authHeader) headers.Authorization = authHeader;

    const res = await fetch(`${backendUrl}/api/ai/quota`, { headers });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  // Local fallback response (Free default: 3 generations)
  return NextResponse.json({
    success: true,
    data: {
      plan: "free",
      is_pro: false,
      total_quota: 3,
      used_quota: 0,
      remaining_quota: 3,
      can_generate: true,
      reset_info: "3 kali generate gratis per akun",
    },
  });
}

