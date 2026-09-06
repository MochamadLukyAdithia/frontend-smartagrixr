import { NextRequest } from "next/server";
import { API_URL } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const id = (await context.params).id;
  const searchParams = request.nextUrl.searchParams;
  const queryToken = searchParams.get("access_token");
  const authHeader = request.headers.get("authorization") || "";
  const token = queryToken || authHeader.replace("Bearer ", "").trim();

  const res = await fetch(`${API_URL}/api/assets/${id}/url`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return new Response(
      JSON.stringify({ message: "Gagal mengambil URL aset." }),
      { status: res.status, headers: { "Content-Type": "application/json" } }
    );
  }

  const json = (await res.json()) as { data?: { url?: string } };
  const url = json.data?.url;

  if (!url) {
    return Response.json({ message: "URL aset tidak tersedia." }, { status: 404 });
  }

  const upstream = await fetch(url, {
    headers: {
      Accept:
        "model/gltf-binary,model/gltf+json,application/octet-stream,*/*",
    },
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return new Response(
      JSON.stringify({ message: "Model 3D tidak dapat dimuat." }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") || "model/gltf-binary");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Cache-Control", "public, max-age=300");
  headers.set("X-Accel-Buffering", "no");

  return new Response(upstream.body, { status: 200, headers });
}
