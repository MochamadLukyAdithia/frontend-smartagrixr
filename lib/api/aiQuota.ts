/**
 * Client helper for AI 3D Generation Quota, Ticket, Consumption, Refund, and History
 */

import { API_URL } from "@/lib/api";

export interface AiQuotaData {
  plan: "free" | "pro" | "enterprise" | "guest";
  is_pro: boolean;
  total_quota: number;
  used_quota: number;
  remaining_quota: number;
  can_generate: boolean;
  reset_info?: string;
}

export interface AiTicketData {
  ticket_id: string;
  valid: boolean;
  remaining_quota: number;
  plan: string;
}

export interface AiHistoryRecord {
  id: string;
  prompt: string;
  model: string;
  modelUrl: string;
  previewUrl?: string | null;
  createdAt: string;
}

const LOCAL_STORAGE_KEY_QUOTA = "smartagri_ai_quota_cache";
const LOCAL_STORAGE_KEY_HISTORY = "tripo3d_generation_history";

/**
 * Fetch current user / guest AI generation quota
 */
export async function fetchAiQuota(token?: string | null): Promise<AiQuotaData> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    // 1. Try Laravel backend first
    const res = await fetch(`${API_URL}/api/ai/quota`, { headers });
    if (res.ok) {
      const json = await res.json();
      const quota = (json?.data || json) as AiQuotaData;
      if (typeof quota.remaining_quota === "number") {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY_QUOTA, JSON.stringify(quota));
        } catch {}
        return quota;
      }
    }
  } catch (e) {
    // Backend unreachable, fallback to Next.js route
  }

  try {
    // 2. Try Next.js internal API route fallback
    const localRes = await fetch("/api/ai/quota", { headers });
    if (localRes.ok) {
      const json = await localRes.json();
      return (json?.data || json) as AiQuotaData;
    }
  } catch (e) {
    // fallback
  }

  // 3. Fallback from localStorage or default Free limit (3)
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY_QUOTA);
    if (cached) return JSON.parse(cached);
  } catch {}

  return {
    plan: "free",
    is_pro: false,
    total_quota: 3,
    used_quota: 0,
    remaining_quota: 3,
    can_generate: true,
    reset_info: "3 kali generate gratis per akun",
  };
}

/**
 * Verify and issue ticket before generation
 */
export async function verifyAiTicket(
  prompt: string,
  model: string,
  token?: string | null
): Promise<AiTicketData> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const body = JSON.stringify({ prompt, model });

  // 1. Try backend
  try {
    const res = await fetch(`${API_URL}/api/ai/verify-ticket`, {
      method: "POST",
      headers,
      body,
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(
        json?.message ||
          "Kuota generate AI gratis Anda telah habis (3/3 kali). Silakan upgrade ke paket Pro."
      );
    }
    return (json?.data || json) as AiTicketData;
  } catch (e: any) {
    if (e.message && !e.message.includes("fetch")) {
      throw e;
    }
  }

  // 2. Fallback to Next.js route
  try {
    const localRes = await fetch("/api/ai/verify-ticket", {
      method: "POST",
      headers,
      body,
    });
    const json = await localRes.json();
    if (!localRes.ok) {
      throw new Error(json?.message || "Gagal memverifikasi tiket AI.");
    }
    return (json?.data || json) as AiTicketData;
  } catch (e: any) {
    if (e.message && !e.message.includes("fetch")) throw e;
  }

  // 3. Standalone simulation ticket
  return {
    ticket_id: `tkt_local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    valid: true,
    remaining_quota: 2,
    plan: "free",
  };
}

/**
 * Deduct/consume 1 quota ticket
 */
export async function consumeAiTicket(
  params: { ticket_id: string; prompt: string; model: string; task_id?: string },
  token?: string | null
): Promise<void> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const body = JSON.stringify(params);

  try {
    await fetch(`${API_URL}/api/ai/consume`, { method: "POST", headers, body });
  } catch {}

  try {
    await fetch("/api/ai/consume", { method: "POST", headers, body });
  } catch {}
}

/**
 * Refund 1 quota ticket if generation failed or was cancelled
 */
export async function refundAiTicket(
  params: { ticket_id: string; reason?: string },
  token?: string | null
): Promise<void> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const body = JSON.stringify(params);

  try {
    await fetch(`${API_URL}/api/ai/refund`, { method: "POST", headers, body });
  } catch {}

  try {
    await fetch("/api/ai/refund", { method: "POST", headers, body });
  } catch {}
}

/**
 * Fetch AI generation history
 */
export async function fetchAiHistory(token?: string | null): Promise<AiHistoryRecord[]> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_URL}/api/ai/history`, { headers });
    if (res.ok) {
      const json = await res.json();
      const list = (json?.data || json) as AiHistoryRecord[];
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch {}

  try {
    const localRes = await fetch("/api/ai/history", { headers });
    if (localRes.ok) {
      const json = await localRes.json();
      const list = (json?.data || json) as AiHistoryRecord[];
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch {}

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
    if (local) return JSON.parse(local);
  } catch {}

  return [];
}

/**
 * Store completed 3D generation item into history
 */
export async function saveAiHistory(
  payload: {
    ticket_id?: string;
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

  try {
    await fetch(`${API_URL}/api/ai/history`, { method: "POST", headers, body });
  } catch {}

  try {
    await fetch("/api/ai/history", { method: "POST", headers, body });
  } catch {}
}

