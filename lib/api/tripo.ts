// Helper client for Tripo3D P-Series Text-to-3D Generation

export interface TripoGenerateParams {
  prompt: string;
  negative_prompt?: string;
  model: "P1-20260311" | "P2-20260801";
  face_limit?: number;
  texture?: boolean;
  pbr?: boolean;
  texture_quality?: "standard" | "detailed" | "extreme";
  auto_size?: boolean;
  quad?: boolean;
  compress?: "geometry";
  export_orientation?: "+x" | "-x" | "+y" | "-y";
}

export interface TripoTaskOutput {
  model?: string;
  pbr_model?: string;
  base_model?: string;
  rendered_image?: string;
}

export interface TripoTaskData {
  task_id: string;
  type?: string;
  status: "queued" | "running" | "success" | "failed" | "cancelled";
  progress?: number;
  output?: TripoTaskOutput;
  result?: {
    model?: {
      url?: string;
    };
    pbr_model?: {
      url?: string;
    };
    rendered_image?: {
      url?: string;
    };
  };
}

export interface TripoTaskResponse {
  code: number;
  data: TripoTaskData;
  message?: string;
}

/**
 * Start a Text-to-3D generation task
 */
export async function createTextTo3DTask(params: TripoGenerateParams, apiKey?: string): Promise<string> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (apiKey && apiKey.trim()) {
    headers["x-tripo-api-key"] = apiKey.trim();
  }

  const res = await fetch("/api/tripo", {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || `Failed to start generation (${res.status})`);
  }

  const json: TripoTaskResponse = await res.json();
  if (json.code !== 0 && json.code !== undefined && !json.data?.task_id) {
    throw new Error(json.message || "Tripo3D error creating task");
  }

  const taskId = json.data?.task_id;
  if (!taskId) {
    throw new Error("No task_id returned from Tripo3D");
  }

  return taskId;
}

/**
 * Query task status
 */
export async function queryTripoTask(taskId: string, apiKey?: string): Promise<TripoTaskData> {
  const headers: HeadersInit = {};
  if (apiKey && apiKey.trim()) {
    headers["x-tripo-api-key"] = apiKey.trim();
  }

  const res = await fetch(`/api/tripo?taskId=${encodeURIComponent(taskId)}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || `Failed to query task (${res.status})`);
  }

  const json: any = await res.json();
  const taskData: TripoTaskData = json.data || json;
  if (!taskData || (!taskData.status && json.code !== 0)) {
    throw new Error(json.message || "Failed to retrieve task data from Tripo3D");
  }
  return taskData;
}

/**
 * Extract download URL for the GLB model from output
 */
export function extractModelUrl(taskData: any): string | null {
  if (!taskData) return null;
  
  // 1. Direct output fields
  if (taskData.output?.pbr_model) return taskData.output.pbr_model;
  if (taskData.output?.model) return taskData.output.model;
  if (taskData.output?.base_model) return taskData.output.base_model;
  if (taskData.output?.model_url) return taskData.output.model_url;
  if (taskData.output?.glb) return taskData.output.glb;

  // 2. Result structure
  if (taskData.result?.pbr_model?.url) return taskData.result.pbr_model.url;
  if (taskData.result?.model?.url) return taskData.result.model.url;
  if (taskData.result?.model_url) return taskData.result.model_url;

  // 3. Top-level direct fields
  if (taskData.model_url) return taskData.model_url;
  if (taskData.pbr_model) return taskData.pbr_model;
  if (taskData.model && typeof taskData.model === "string" && taskData.model.startsWith("http")) return taskData.model;

  // 4. Recursive search for .glb or .gltf URL in the object
  function findGlb(obj: any): string | null {
    if (!obj) return null;
    if (typeof obj === "string") {
      const lower = obj.toLowerCase();
      if ((lower.startsWith("http://") || lower.startsWith("https://")) && (lower.includes(".glb") || lower.includes(".gltf") || lower.includes("tripo"))) {
        return obj;
      }
    } else if (typeof obj === "object") {
      for (const key of Object.keys(obj)) {
        // Skip image fields
        if (key.includes("image") || key.includes("render") || key.includes("thumbnail")) continue;
        const res = findGlb(obj[key]);
        if (res) return res;
      }
    }
    return null;
  }

  return findGlb(taskData);
}

export function extractPreviewImageUrl(taskData: any): string | null {
  if (!taskData) return null;
  if (taskData.output?.rendered_image) return taskData.output.rendered_image;
  if (taskData.output?.thumbnail) return taskData.output.thumbnail;
  if (taskData.result?.rendered_image?.url) return taskData.result.rendered_image.url;
  if (taskData.result?.thumbnail?.url) return taskData.result.thumbnail.url;
  if (taskData.rendered_image) return taskData.rendered_image;

  function findImg(obj: any): string | null {
    if (!obj) return null;
    if (typeof obj === "string") {
      const lower = obj.toLowerCase();
      if ((lower.startsWith("http://") || lower.startsWith("https://")) && (lower.includes(".png") || lower.includes(".jpg") || lower.includes(".jpeg") || lower.includes(".webp"))) {
        return obj;
      }
    } else if (typeof obj === "object") {
      for (const key of Object.keys(obj)) {
        if (key.includes("model") || key.includes("glb")) continue;
        const res = findImg(obj[key]);
        if (res) return res;
      }
    }
    return null;
  }

  return findImg(taskData);
}
