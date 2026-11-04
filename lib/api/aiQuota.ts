/**
 * Client helper synchronized with Backend at D:\github\smartagrixr-dev
 *
 * Endpoints:
 * - GET  /api/ai/quota?feature=ai_2d_to_3d
 * - POST /api/ai/consume
 * - POST /api/ai/refund
 * - POST /api/ai/verify-ticket
 * - GET  /api/ai/history
 * - POST /api/ai/save-result
 */

import { API_URL } from "@/lib/api";

export interface BackendQuotaRaw {
  allowed?: boolean;
  feature?: string;
  plan?: string;
  limit?: number;
  used_today?: number;
  remaining?: number;
  can_generate?: boolean;
  resets_at?: string;
  total_quota?: number;
  used_quota?: number;
  remaining_quota?: number;
}

export interface AiQuotaData {
  allowed: boolean;
  feature: string;
  plan: "free" | "pro" | "enterprise" | "guest" | string;
  limit: number;
  used_today: number;
  remaining: number;
  can_generate: boolean;
  resets_at?: string;
  // Normalized helpers for UI:
  is_pro: boolean;
  total_quota: number;
  used_quota: number;
  remaining_quota: number;
  reset_info: string;
}

export interface ConsumeResponse {
  allowed: boolean;
  message: string;
  usage_id?: number;
  ticket_token?: string;
  quota?: AiQuotaData;
  upgrade_url?: string;
}

export interface AiHistoryRecord {
  id: string | number;
  prompt: string;
  model: string;
  modelUrl: string;
  previewUrl?: string | null;
  createdAt: string;
  status?: string;
}

const LOCAL_STORAGE_KEY_QUOTA = "smartagri_ai_quota_cache";
const LOCAL_STORAGE_KEY_HISTORY = "tripo3d_generation_history";

/**
 * Normalizes raw backend quota response from AiQuotaService into UI-friendly structure
 */
export function normalizeQuota(raw: BackendQuotaRaw): AiQuotaData {
  const planSlug = (raw.plan || "free").toLowerCase();
  const isPro = planSlug === "pro" || planSlug === "enterprise";

  const limit = raw.limit ?? raw.total_quota ?? (isPro ? 50 : 3);
  const usedToday = raw.used_today ?? raw.used_quota ?? 0;
  const remaining = raw.remaining ?? raw.remaining_quota ?? Math.max(0, limit - usedToday);
  const canGen = raw.can_generate ?? raw.allowed ?? (remaining > 0);

  let resetInfo = "3 kali generate per hari (Free)";
  if (isPro) {
    resetInfo = planSlug === "enterprise" ? "200 kali generate per hari (Enterprise)" : "50 kali generate per hari (Pro)";
  } else if (raw.resets_at) {
    resetInfo = "Reset setiap hari pukul 00:00";
  }

  return {
    allowed: canGen,
    feature: raw.feature || "ai_2d_to_3d",
    plan: planSlug,
    limit,
    used_today: usedToday,
    remaining,
    can_generate: canGen,
    resets_at: raw.resets_at,
    is_pro: isPro,
    total_quota: limit,
    used_quota: usedToday,
    remaining_quota: remaining,
    reset_info: resetInfo,
  };
}

/**
 * Fetch current user AI generation quota from GET /api/ai/quota?feature=ai_2d_to_3d
 */
export async function fetchAiQuota(token?: string | null): Promise<AiQuotaData> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  // 1. Panggil backend Laravel (D:\github\smartagrixr-dev)
  if (token) {
    try {
      const res = await fetch(`${API_URL}/api/ai/quota?feature=ai_2d_to_3d`, { headers });
      if (res.ok) {
        const json = await res.json();
        const raw = (json?.data || json) as BackendQuotaRaw;
        const normalized = normalizeQuota(raw);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_QUOTA, JSON.stringify(normalized));
        } catch {}
        return normalized;
      }
    } catch (e) {
      // Backend unreachable, fallback ke Next.js internal API
    }
  }

  // 2. Fallback Next.js internal proxy route
  try {
    const localRes = await fetch("/api/ai/quota?feature=ai_2d_to_3d", { headers });
    if (localRes.ok) {
      const json = await localRes.json();
      const raw = (json?.data || json) as BackendQuotaRaw;
      return normalizeQuota(raw);
    }
  } catch (e) {}

  // 3. Fallback cache localStorage jika offline
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY_QUOTA);
    if (cached) return normalizeQuota(JSON.parse(cached));
  } catch {}

  // Default limit untuk user baru / belum login (3x Free)
  return normalizeQuota({
    plan: token ? "free" : "guest",
    limit: 3,
    used_today: 0,
    remaining: 3,
    can_generate: true,
  });
}

/**
 * Konsumsi 1 kuota generate AI sebelum proses Tripo3D dimulai
 * POST /api/ai/consume
 */
export async function consumeAiQuota(
  params: { prompt: string; model: string; feature?: string },
  token?: string | null
): Promise<ConsumeResponse> {
  const feature = params.feature || "ai_2d_to_3d";
  const body = JSON.stringify({
    feature,
    metadata: {
      prompt: params.prompt,
      model: params.model,
      created_at: new Date().toISOString(),
    },
  });

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  // 1. Coba backend langsung
  if (token) {
    try {
      const res = await fetch(`${API_URL}/api/ai/consume`, {
        method: "POST",
        headers,
        body,
      });

      const json = await res.json();
      if (!res.ok || json.allowed === false) {
        throw new Error(
          json?.message || "Kuota generate AI harian Anda telah habis. Silakan upgrade ke paket Pro."
        );
      }

      return {
        allowed: true,
        message: json.message || "Kuota berhasil dipotong.",
        usage_id: json.usage_id,
        ticket_token: json.ticket_token,
        quota: json.quota ? normalizeQuota(json.quota) : undefined,
      };
    } catch (e: unknown) {
      if (e instanceof Error && !e.message.includes("fetch")) {
        throw e;
      }
    }
  }

  // 2. Fallback Next.js route handler
  try {
    const localRes = await fetch("/api/ai/consume", {
      method: "POST",
      headers,
      body,
    });
    const json = await localRes.json();
    if (!localRes.ok || json.allowed === false) {
      throw new Error(json?.message || "Kuota generate AI harian Anda telah habis.");
    }
    return {
      allowed: true,
      message: json.message || "Kuota berhasil dipotong.",
      usage_id: json.usage_id || Math.floor(Date.now() / 1000),
      ticket_token: json.ticket_token || `tok_${Date.now()}`,
      quota: json.quota ? normalizeQuota(json.quota) : undefined,
    };
  } catch (e: unknown) {
    if (e instanceof Error && !e.message.includes("fetch")) throw e;
  }

  // 3. Fallback standalone jika mode offline
  return {
    allowed: true,
    message: "Kuota dipotong (mode lokal).",
    usage_id: Math.floor(Date.now() / 1000),
    ticket_token: `tok_local_${Date.now()}`,
  };
}

/**
 * Kembalikan kuota jika proses AI generate gagal
 * POST /api/ai/refund
 */
export async function refundAiQuota(
  params: { usage_id?: number | null; reason?: string },
  token?: string | null
): Promise<void> {
  if (!params.usage_id) return;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const body = JSON.stringify({
    usage_id: params.usage_id,
    reason: params.reason || "Pembuatan model 3D AI gagal atau dibatalkan",
  });

  try {
    await fetch(`${API_URL}/api/ai/refund`, { method: "POST", headers, body });
  } catch {}

  try {
    await fetch("/api/ai/refund", { method: "POST", headers, body });
  } catch {}
}

/**
 * Verifikasi tiket di backend
 * POST /api/ai/verify-ticket
 */
export async function verifyAiTicket(
  ticketToken: string,
  feature: string = "ai_2d_to_3d",
  token?: string | null
): Promise<boolean> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const body = JSON.stringify({
    ticket_token: ticketToken,
    feature,
  });

  try {
    const res = await fetch(`${API_URL}/api/ai/verify-ticket`, {
      method: "POST",
      headers,
      body,
    });
    if (res.ok) {
      const json = await res.json();
      return Boolean(json.valid);
    }
  } catch {}

  return true;
}

/**
 * Ambil riwayat AI pengguna dari GET /api/ai/history
 */
export async function fetchAiHistory(token?: string | null): Promise<AiHistoryRecord[]> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  if (token) {
    try {
      const res = await fetch(`${API_URL}/api/ai/history?per_page=20`, { headers });
      if (res.ok) {
        const json = await res.json();
        // Support Laravel paginated response: { data: [...] }
        const rawList = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
        if (rawList.length > 0) {
          return (rawList as Record<string, unknown>[]).map((item) => {
            const meta = (item.metadata as Record<string, unknown>) || {};
            return {
              id: (item.id as string | number) || (item.ticket_token as string),
              prompt: (meta.prompt as string) || (item.prompt as string) || "Model 3D AI",
              model: (meta.model as string) || (item.model as string) || "P2-20260801",
              modelUrl: (meta.model_url as string) || (item.model_url as string) || (item.modelUrl as string) || "",
              previewUrl: (meta.preview_url as string) || (item.preview_url as string) || (item.previewUrl as string) || null,
              createdAt: (item.created_at as string) || new Date().toISOString(),
              status: item.status as string | undefined,
            };
          }).filter((item: AiHistoryRecord) => Boolean(item.modelUrl));
        }
      }
    } catch {}
  }

  // Fallback ke Next.js internal API
  try {
    const localRes = await fetch("/api/ai/history", { headers });
    if (localRes.ok) {
      const json = await localRes.json();
      const rawList = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
      if (rawList.length > 0) {
        return (rawList as Record<string, unknown>[]).map((item) => {
          const meta = (item.metadata as Record<string, unknown>) || {};
          return {
            id: (item.id as string | number) || (item.ticket_token as string),
            prompt: (meta.prompt as string) || (item.prompt as string) || "Model 3D AI",
            model: (meta.model as string) || (item.model as string) || "P2-20260801",
            modelUrl: (meta.model_url as string) || (item.model_url as string) || (item.modelUrl as string) || "",
            previewUrl: (meta.preview_url as string) || (item.preview_url as string) || (item.previewUrl as string) || null,
            createdAt: (item.created_at as string) || new Date().toISOString(),
          };
        }).filter((item: AiHistoryRecord) => Boolean(item.modelUrl));
      }
    }
  } catch {}

  // Fallback localStorage
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
    if (local) return JSON.parse(local);
  } catch {}

  return [];
}

/**
 * Simpan hasil 3D yang berhasil dibuat ke POST /api/ai/save-result
 */
export async function saveAiResult(
  payload: {
    usage_id?: number | null;
    ticket_token?: string | null;
    prompt: string;
    model: string;
    model_url: string;
    preview_url?: string | null;
    task_id?: string;
  },
  token?: string | null
): Promise<void> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const body = JSON.stringify(payload);

  if (token) {
    try {
      await fetch(`${API_URL}/api/ai/save-result`, { method: "POST", headers, body });
    } catch {}
  }

  try {
    await fetch("/api/ai/history", { method: "POST", headers, body });
  } catch {}
}
