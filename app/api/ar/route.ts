import { NextRequest, NextResponse } from "next/server";

// In-memory scene store keyed by session/scene ID
const arSceneStore = new Map<string, { objects: any[]; environment: any; updatedAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sceneId, objects, environment } = body;
    const id = sceneId || "scene_" + Math.random().toString(36).substring(2, 9);

    arSceneStore.set(id, {
      objects: objects || [],
      environment: environment || {},
      updatedAt: Date.now(),
    });

    return NextResponse.json({ success: true, sceneId: id });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to store AR scene" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || !arSceneStore.has(id)) {
    // Return sample demo agriculture scene if id not found
    return NextResponse.json({
      success: true,
      sceneId: id || "demo",
      objects: [
        {
          id: "agri_greenhouse_demo",
          name: "Smart Greenhouse",
          type: "agri",
          agriType: "greenhouse",
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          description: "Automated climate-controlled greenhouse for precision agriculture.",
          annotations: [
            {
              id: "anno_demo",
              title: "Smart Greenhouse",
              description: "Equipped with automated temperature and humidity regulation.",
              position: [0, 2.5, 0]
            }
          ]
        },
        {
          id: "agri_sensor_demo",
          name: "IoT Soil Sensor",
          type: "agri",
          agriType: "solar_sensor",
          position: [3, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          description: "Real-time NPK and moisture sensor node.",
        }
      ],
      environment: {
        preset: "farm",
        bgColor: "#bbf7d0",
      }
    });
  }

  const data = arSceneStore.get(id);
  return NextResponse.json({
    success: true,
    sceneId: id,
    ...data,
  });
}
