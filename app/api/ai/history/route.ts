import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://backend-smartagrixr-production.up.railway.app";
  const authHeader = req.headers.get("authorization");

  try {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (authHeader) headers.Authorization = authHeader;

    const res = await fetch(`${backendUrl}/api/ai/history`, { headers });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {}

  return NextResponse.json({
    data: [],
  });
}

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

    // Coba save-result di smartagrixr-dev
    const res = await fetch(`${backendUrl}/api/ai/save-result`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {}

  return NextResponse.json({
    success: true,
  });
}
