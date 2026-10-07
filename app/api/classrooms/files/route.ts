import { NextRequest } from "next/server";
import { API_URL } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JSON_HEADERS = { "Content-Type": "application/json" };

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("access_token") || "";
  const path = searchParams.get("path") || "";
  const url = searchParams.get("url") || "";

  if (url && /^https?:\/\//i.test(url)) {
    return Response.redirect(url, 302);
  }

  if (!path) {
    return new Response(
      JSON.stringify({ message: "Path file tidak valid." }),
      { status: 400, headers: JSON_HEADERS }
    );
  }

  const cleanPath = path.replace(/^\/+/, "");
  const candidates = [
    `${API_URL}/${cleanPath}`,
    `${API_URL}/storage/${cleanPath}`,
    `${API_URL}/uploads/${cleanPath}`,
  ];

  for (const candidate of candidates) {
    try {
      const upstream = await fetch(candidate, {
        headers: {
          Accept: "application/octet-stream,*/*",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      if (upstream.ok && upstream.body) {
        const headers = new Headers();
        const contentType = upstream.headers.get("content-type");
        if (contentType) headers.set("Content-Type", contentType);
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Cache-Control", "private, max-age=300");
        headers.set("X-Accel-Buffering", "no");
        return new Response(upstream.body, { status: 200, headers });
      }
    } catch {
      // coba kandidat URL berikutnya
    }
  }

  return new Response(
    JSON.stringify({ message: "File tidak dapat dimuat." }),
    { status: 502, headers: JSON_HEADERS }
  );
}