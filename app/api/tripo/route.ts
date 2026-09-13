import { NextRequest, NextResponse } from "next/server";

const TRIPO_BASE_URL = "https://openapi.tripo3d.ai/v3";

function getApiKey(req: NextRequest, bodyKey?: string): string {
  const envKey = process.env.TRIPO_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();
  const headerKey = req.headers.get("x-tripo-api-key");
  if (headerKey && headerKey.trim()) return headerKey.trim();
  if (bodyKey && bodyKey.trim()) return bodyKey.trim();
  return "";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, taskId, apiKey, ...generationParams } = body;
    const keyToUse = getApiKey(req, apiKey);

    // Action 1: Query task status
    if (action === "query_task" || taskId) {
      const idToQuery = taskId || body.task_id;
      if (!idToQuery) {
        return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
      }

      // Query Tripo3D task endpoint
      const response = await fetch(`${TRIPO_BASE_URL}/task/${idToQuery}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${keyToUse}`,
          "Accept": "application/json",
        },
      });

      const data = await response.json();
      return NextResponse.json(data);
    }

    // Action 2: Create generation task (Text to 3D Model — P Series)
    const payload: Record<string, any> = {
      prompt: generationParams.prompt,
      model: generationParams.model || "P1-20260311",
      texture: generationParams.texture !== false,
      pbr: generationParams.pbr !== false,
    };

    if (generationParams.negative_prompt) {
      payload.negative_prompt = generationParams.negative_prompt;
    }
    if (generationParams.face_limit) {
      payload.face_limit = Number(generationParams.face_limit);
    }
    if (generationParams.texture_quality) {
      payload.texture_quality = generationParams.texture_quality;
    }
    if (generationParams.auto_size !== undefined) {
      payload.auto_size = Boolean(generationParams.auto_size);
    }
    if (generationParams.quad !== undefined) {
      payload.quad = Boolean(generationParams.quad);
    }
    if (generationParams.compress) {
      payload.compress = generationParams.compress;
    }
    if (generationParams.export_orientation) {
      payload.export_orientation = generationParams.export_orientation;
    }

    const response = await fetch(`${TRIPO_BASE_URL}/generation/text-to-model`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${keyToUse}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Tripo3D API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during Tripo3D request" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId") || searchParams.get("task_id");
  const apiKey = searchParams.get("apiKey") || undefined;
  const keyToUse = getApiKey(req, apiKey);

  if (!taskId) {
    return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
  }

  try {
    let response = await fetch(`${TRIPO_BASE_URL}/task/${taskId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${keyToUse}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok && (response.status === 404 || response.status === 400)) {
      response = await fetch(`${TRIPO_BASE_URL}/tasks/${taskId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${keyToUse}`,
          "Accept": "application/json",
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error querying Tripo3D task" },
      { status: 500 }
    );
  }
}
