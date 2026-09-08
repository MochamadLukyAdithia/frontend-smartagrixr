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
  file_extension?: string | null;
  extension?: string | null;
  asset_type?: string | null;
}

export function assetExtensionCandidates(
  fileExtension: string | null | undefined,
  extension: string | null | undefined,
  assetType: string | null | undefined,
  name: string,
  thumbnailUrl: string | null | undefined
): string[] {
  const samples = [fileExtension, extension, assetType, name, thumbnailUrl]
    .filter((v): v is string => Boolean(v))
    .join("|")
    .toLowerCase();

  if (/\bobj\b|\.obj|wavefront|model\/obj/.test(samples)) return [".obj"];
  if (/\bglb\b|\.glb|gltf-binary|model\/gltf/.test(samples)) return [".glb"];
  return [".glb", ".obj"];
}

export interface AssetsResponse {
  my_assets: ApiAsset[];
  public_assets: ApiAsset[];
}

interface LoginCredentials {
  email: string;
  password: string;
}

export function getGoogleLoginUrl(): string {
  return `${API_URL}/auth/google/redirect`;
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

export async function fetchMe(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/api/me`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });

  const data = res.status !== 204 ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new Error(
      (data as { message?: string } | null)?.message ||
        "Gagal mengambil profil user."
    );
  }

  const user = (data as { user?: User } | null)?.user;
  if (!user) throw new Error("Response profil tidak valid.");
  return user;
}

export interface UploadAssetParams {
  file: File;
  name: string;
  category: string;
  is_public: boolean;
}

export interface Classroom {
  id: number;
  teacher_id: number;
  name: string;
  description: string | null;
  subject: string | null;
  invite_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  students_count: number;
}

export interface ClassroomsResponse {
  as_teacher: Classroom[];
  as_student: Classroom[];
}

export interface CreateClassroomParams {
  name: string;
  description: string;
  subject: string;
}

export async function fetchClassrooms(
  token: string
): Promise<ClassroomsResponse> {
  const res = await fetch(`${API_URL}/api/classrooms`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });

  const data = res.status !== 204 ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new Error(
      (data as { message?: string } | null)?.message ||
        "Gagal mengambil daftar kelas."
    );
  }

  return (data as { data?: ClassroomsResponse } | null)?.data ?? {
    as_teacher: [],
    as_student: [],
  };
}
export async function createClassroom(
  token: string,
  params: CreateClassroomParams
): Promise<Classroom> {
  const res = await fetch(`${API_URL}/api/classrooms`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const data = res.status !== 204 ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new Error(
      (data as { message?: string } | null)?.message ||
        "Gagal membuat kelas baru."
    );
  }

  const created = (data as { data?: Classroom } | null)?.data;
  if (!created) throw new Error("Response pembuatan kelas tidak valid.");
  return created;
}

function classroomErrorMessage(
  status: number,
  message: string | null | undefined,
  fallback: string
): string {
  if (
    status === 404 ||
    (message && message.includes("No query results for model"))
  ) {
    return "Kode kelas tidak ditemukan. Periksa kembali kode undangan Anda.";
  }
  return message || fallback;
}

export async function joinClassroom(
  token: string,
  code: string
): Promise<Classroom> {
  const res = await fetch(
    `${API_URL}/api/classrooms/join/${encodeURIComponent(code)}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = res.status !== 204 ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new Error(
      classroomErrorMessage(
        res.status,
        (data as { message?: string } | null)?.message,
        "Gagal bergabung ke kelas."
      )
    );
  }

  const joined = (data as { data?: Classroom } | null)?.data;
  if (!joined) throw new Error("Response join kelas tidak valid.");
  return joined;
}

export interface ClassroomTeacher {
  id: number;
  name: string;
  username: string | null;
  email: string;
  phone: string | null;
  status: string;
  unej_role: string;
  avatar: string | null;
}

export interface ClassroomStudent {
  id: number;
  name: string;
  [key: string]: unknown;
}

export interface ClassroomDetail extends Classroom {
  teacher: ClassroomTeacher;
  students: ClassroomStudent[];
}

export async function fetchClassroom(
  token: string,
  id: number | string
): Promise<ClassroomDetail> {
  const res = await fetch(`${API_URL}/api/classrooms/${id}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });

  const data = res.status !== 204 ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = (data as { message?: string } | null)?.message;
    throw new Error(
      res.status === 404 ||
        (message && message.includes("No query results for model"))
        ? "Kelas tidak ditemukan atau sudah dihapus."
        : message || "Gagal mengambil detail kelas."
    );
  }

  const detail = (data as { data?: ClassroomDetail } | null)?.data;
  if (!detail) throw new Error("Response detail kelas tidak valid.");
  return detail;
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