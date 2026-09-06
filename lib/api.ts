export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  unej_role?: string;
  provider?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiAsset {
  id: number;
  name: string;
  category: string | null;
  category_id: number | null;
  is_pro: boolean;
  is_public: boolean;
  file_size: number;
  thumbnail_url: string | null;
}

export interface AssetsResponse {
  my_assets: ApiAsset[];
  public_assets: ApiAsset[];
}

interface LoginCredentials {
  email: string;
  password: string;
}

export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  let data: Record<string, unknown> | null = null;
  if (res.status !== 204) {
    data = await res.json().catch(() => null);
  }

  if (!res.ok) {
    const errors = (data as { errors?: Record<string, string[]> } | null)
      ?.errors;
    const firstError = errors
      ? Object.values(errors)[0]?.[0]
      : null;
    throw new Error(
      firstError ||
        (data as { message?: string } | null)?.message ||
        "Email atau kata sandi salah."
    );
  }

  const nested = (data as { data?: Record<string, unknown> } | null)?.data;
  const token = (data?.token ||
    data?.access_token ||
    nested?.token ||
    nested?.access_token) as string | undefined;
  const user = (data?.user || nested?.user) as User | undefined;

  if (!token || !user) {
    throw new Error("Response login tidak valid.");
  }

  return { token, user };
}

export async function fetchAssets(token: string): Promise<AssetsResponse> {
  const res = await fetch(`${API_URL}/api/assets`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });

  const data = res.status !== 204 ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new Error(
      (data as { message?: string } | null)?.message ||
        "Gagal mengambil daftar aset."
    );
  }

  return (data as { data?: AssetsResponse } | null)?.data ?? data ?? {
    my_assets: [],
    public_assets: [],
  };
}

export async function fetchAssetUrl(
  token: string,
  id: number
): Promise<string> {
  const res = await fetch(`${API_URL}/api/assets/${id}/url`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });

  const data = res.status !== 204 ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new Error(
      (data as { message?: string } | null)?.message ||
        "Gagal memuat preview aset."
    );
  }

  const url = (data as { data?: { url?: string } } | null)?.data?.url;
  if (!url) throw new Error("URL aset tidak tersedia.");
  return url;
}

export async function deleteAsset(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/assets/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = res.status !== 204 ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new Error(
      (data as { message?: string } | null)?.message ||
        "Gagal menghapus aset."
    );
  }
}

export interface UploadAssetParams {
  file: File;
  name: string;
  category: string;
  is_public: boolean;
}

export async function uploadAsset(
  token: string,
  params: UploadAssetParams
): Promise<ApiAsset> {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("name", params.name);
  formData.append("category", params.category);
  formData.append("is_public", params.is_public ? "1" : "0");

  const res = await fetch(`${API_URL}/api/assets/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = res.status !== 204 ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new Error(
      (data as { message?: string } | null)?.message ||
        "Gagal mengupload aset."
    );
  }

  const created = (data as { data?: ApiAsset } | null)?.data;
  if (!created) throw new Error("Response upload tidak valid.");
  return created;
}