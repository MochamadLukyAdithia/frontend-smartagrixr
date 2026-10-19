export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://backend-smartagrixr-production.up.railway.app"
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
  type?: string | null;
  file_url?: string | null;
  locked?: boolean;
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

export interface RegisterParams {
  name: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export async function register(
  params: RegisterParams
): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  let data: Record<string, unknown> | null = null;
  if (res.status !== 204) {
    data = await res.json().catch(() => null);
  }

  if (!res.ok) {
    const errors = (data as { errors?: Record<string, string[]> } | null)
      ?.errors;
    const firstError = errors ? Object.values(errors)[0]?.[0] : null;
    throw new Error(
      firstError ||
        (data as { message?: string } | null)?.message ||
        "Gagal membuat akun."
    );
  }

  return data ?? {};
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

export async function fetchAssets(
  token: string | null
): Promise<AssetsResponse> {
  const url = token
    ? `${API_URL}/api/assets`
    : `${API_URL}/api/assets/public`;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers });

  const data = res.status !== 204 ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new Error(
      (data as { message?: string } | null)?.message ||
        "Gagal mengambil daftar aset."
    );
  }

  const body = (data as { data?: unknown } | null)?.data ?? data;

  // Bentuk normal: { my_assets: [], public_assets: [] }
  if (
    body &&
    typeof body === "object" &&
    "my_assets" in body &&
    "public_assets" in body
  ) {
    return body as AssetsResponse;
  }

  // Bentuk paginator publik: { data: [...] }
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    Array.isArray((body as { data: unknown }).data)
  ) {
    return {
      my_assets: [],
      public_assets: (body as { data: ApiAsset[] }).data,
    };
  }

  // Bentuk array langsung jika ada
  if (Array.isArray(body)) {
    return { my_assets: [], public_assets: body as ApiAsset[] };
  }

  return { my_assets: [], public_assets: [] };
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
  /** Thumbnail hasil generate dari model 3D (opsional). */
  thumbnail?: File | null;
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

export interface UpdateClassroomParams {
  name: string;
  description: string;
  subject: string;
  is_active: boolean;
}

export async function updateClassroom(
  token: string,
  id: number | string,
  params: UpdateClassroomParams
): Promise<Classroom> {
  const res = await fetch(`${API_URL}/api/classrooms/${id}`, {
    method: "PUT",
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
        "Gagal memperbarui kelas."
    );
  }

  const updated = (data as { data?: Classroom } | null)?.data;
  if (!updated) throw new Error("Response update kelas tidak valid.");
  return updated;
}

export async function deleteClassroom(
  token: string,
  id: number | string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/classrooms/${id}`, {
    method: "DELETE",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });

  const data = res.status !== 204 ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new Error(
      (data as { message?: string } | null)?.message ||
        "Gagal menghapus kelas."
    );
  }
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
  if (params.thumbnail) formData.append("thumbnail", params.thumbnail);

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

// ── Feed & Komentar Kelas ──

export interface SocialAuthor {
  id: number;
  name: string;
  avatar: string | null;
}

export interface SocialComment {
  id: number;
  body: string;
  user: SocialAuthor;
  likes_count: number;
  is_liked: boolean;
  created_at: string;
  parent_id: number | null;
  replies: SocialComment[];
}

export interface FeedFile {
  id: number;
  name: string;
  url: string | null;
  /** Path relatif file di backend (jika `url` berasal dari `path`). */
  path?: string | null;
  size: number;
  mimeType?: string | null;
  extension?: string | null;
}

export interface FeedPost {
  id: number;
  type: string | null;
  title: string | null;
  body: string;
  due_at: string | null;
  max_score: number | null;
  allow_late: boolean | null;
  category: string | null;
  is_pinned: boolean;
  files: FeedFile[];
  user: SocialAuthor;
  likes_count: number;
  is_liked: boolean;
  comments_count: number;
  created_at: string;
}

type LikeResult = { likes_count: number; is_liked: boolean };

function normalizeAuthor(raw: unknown): SocialAuthor {
  const a = (raw ?? {}) as Record<string, unknown>;
  const anyA = raw as {
    id?: unknown;
    name?: string;
    username?: string;
    full_name?: string;
    avatar?: string | null;
    profile?: { name?: string; avatar?: string | null };
  } | null;
  return {
    id: Number(anyA?.id ?? 0),
    name: String(
      anyA?.name ??
        anyA?.full_name ??
        (anyA?.profile as { name?: string } | undefined)?.name ??
        (a.username as string) ??
        "Pengguna"
    ),
    avatar:
      anyA?.avatar ??
      (anyA?.profile as { avatar?: string | null } | undefined)?.avatar ??
      null,
  };
}

export function normalizeComment(raw: unknown): SocialComment {
  const c = (raw ?? {}) as Record<string, unknown>;
  const anyC = raw as {
    id?: unknown;
    body?: string;
    content?: string;
    text?: string;
    comment?: string;
    user?: unknown;
    author?: unknown;
    creator?: unknown;
    likes_count?: unknown;
    likes?: unknown;
    is_liked?: unknown;
    liked?: unknown;
    created_at?: string;
    parent_id?: unknown;
    replies?: unknown[];
  } | null;
  return {
    id: Number(anyC?.id ?? 0),
    body: String(
      anyC?.body ??
        anyC?.content ??
        anyC?.text ??
        anyC?.comment ??
        c.value ??
        ""
    ),
    user: normalizeAuthor(anyC?.user ?? anyC?.author ?? anyC?.creator),
    likes_count: Number(anyC?.likes_count ?? anyC?.likes ?? 0),
    is_liked: Boolean(anyC?.is_liked ?? anyC?.liked ?? false),
    created_at: String(anyC?.created_at ?? ""),
    parent_id: anyC?.parent_id != null ? Number(anyC.parent_id) : null,
    replies: Array.isArray(anyC?.replies)
      ? anyC.replies.map((r) => normalizeComment(r))
      : [],
  };
}

function normalizeFeedFile(raw: unknown): FeedFile {
  const f = (raw ?? {}) as Record<string, unknown>;
  const anyF = raw as {
    id?: unknown;
    name?: string | null;
    original_name?: string | null;
    file_name?: string | null;
    original?: string | null;
    path?: string | null;
    url?: string | null;
    file_url?: string | null;
    size?: unknown;
    file_size?: unknown;
    mime_type?: string | null;
    mimeType?: string | null;
    extension?: string | null;
  } | null;
  let url = anyF?.url ?? anyF?.file_url ?? null;
  if (!url && anyF?.path) {
    url = /^https?:\/\//.test(anyF.path)
      ? anyF.path
      : `${API_URL}/${String(anyF.path).replace(/^\/+/, "")}`;
  }
  return {
    id: Number(anyF?.id ?? 0),
    name: String(
      anyF?.name ??
        anyF?.original_name ??
        anyF?.original ??
        anyF?.file_name ??
        (f.file as string) ??
        "File"
    ),
    url,
    path: anyF?.path != null ? String(anyF.path) : null,
    size: Number(anyF?.size ?? anyF?.file_size ?? (f.size as number) ?? 0),
    mimeType: anyF?.mime_type ?? anyF?.mimeType ?? null,
    extension: anyF?.extension ?? null,
  };
}

/**
 * Membuat URL file kelas yang melewati proxy autentikasi di frontend.
 * File yang disimpan backend (punya `path`) hanya bisa diakses dengan token,
 * sehingga diproksi lewat `/api/classrooms/files` agar bisa tampil
 * di `<iframe>` / `<img>` / tautan unduh tanpa header Authorization.
 */
export function classroomFileUrl(
  file: FeedFile,
  token: string | null
): string | null {
  if (!file.path && !file.url) return null;
  const origin =
    typeof window !== "undefined" && window.location ? window.location.origin : "";
  const params = new URLSearchParams();
  if (file.path) params.set("path", file.path);
  else if (file.url) params.set("url", file.url);
  if (token) params.set("access_token", token);
  return `${origin}/api/classrooms/files?${params.toString()}`;
}

function normalizePost(raw: unknown): FeedPost {
  const anyP = raw as {
    id?: unknown;
    type?: string;
    title?: string;
    body?: string;
    content?: string;
    text?: string;
    caption?: string;
    due_at?: string;
    max_score?: unknown;
    allow_late?: unknown;
    category?: string;
    is_pinned?: unknown;
    media?: unknown[];
    files?: unknown[];
    attachments?: unknown[];
    user?: unknown;
    author?: unknown;
    creator?: unknown;
    assignment?: {
      due_at?: string;
      max_score?: unknown;
      allow_late?: unknown;
    } | null;
    likes_count?: unknown;
    likes?: unknown;
    is_liked?: unknown;
    liked?: unknown;
    comments_count?: unknown;
    created_at?: string;
    published_at?: string;
  } | null;
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: Number(anyP?.id ?? 0),
    type: anyP?.type != null ? String(anyP.type) : null,
    title: anyP?.title != null ? String(anyP.title) : null,
    body: String(
      anyP?.body ?? anyP?.content ?? anyP?.text ?? anyP?.caption ?? r.value ?? ""
    ),
    due_at: normalizeNullableField(
      anyP?.due_at ?? anyP?.assignment?.due_at
    ),
    max_score:
      anyP?.max_score != null &&
      anyP?.max_score !== "" &&
      anyP?.max_score !== null
        ? Number(anyP.max_score)
        : anyP?.assignment?.max_score != null
          ? Number(anyP.assignment.max_score)
          : null,
    allow_late: anyP?.allow_late != null
      ? Boolean(anyP.allow_late)
      : anyP?.assignment?.allow_late != null
        ? Boolean(anyP.assignment.allow_late)
        : null,
    category: anyP?.category != null ? String(anyP.category) : null,
    is_pinned: Boolean(anyP?.is_pinned ?? false),
    files: Array.isArray(anyP?.media)
      ? anyP.media.map(normalizeFeedFile)
      : Array.isArray(anyP?.files)
        ? anyP.files.map(normalizeFeedFile)
        : Array.isArray(anyP?.attachments)
          ? anyP.attachments.map(normalizeFeedFile)
          : [],
    user: normalizeAuthor(anyP?.user ?? anyP?.author ?? anyP?.creator),
    likes_count: Number(anyP?.likes_count ?? anyP?.likes ?? 0),
    is_liked: Boolean(anyP?.is_liked ?? anyP?.liked ?? false),
    comments_count: Number(
      anyP?.comments_count ?? (r.comment_count as unknown) ?? 0
    ),
    created_at: String(anyP?.created_at ?? anyP?.published_at ?? ""),
  };
}

function normalizeNullableField(value: unknown): string | null {
  return value != null && value !== "" ? String(value) : null;
}

function unwrapList<T>(json: unknown, normalize: (raw: unknown) => T): T[] {
  const anyJson = json as { data?: unknown } & Record<string, unknown>;
  const d = anyJson?.data ?? anyJson;
  const list = Array.isArray(d)
    ? d
    : (d as { data?: unknown[] })?.data ?? (d as { posts?: unknown[] })?.posts;
  return Array.isArray(list) ? list.map(normalize) : [];
}

function readLikeResult(json: unknown): LikeResult {
  const anyJson = json as { data?: unknown } & Record<string, unknown>;
  const d = (anyJson?.data ?? anyJson) as Record<string, unknown> | null;
  return {
    likes_count: Number(d?.likes_count ?? d?.likes ?? 0),
    is_liked: Boolean(d?.is_liked ?? d?.liked ?? false),
  };
}

async function socialRequest<T>(
  path: string,
  token: string | null,
  init: RequestInit = {}
): Promise<{ status: number; data: T | null }> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  const body =
    res.status !== 204 ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = (body as { message?: string } | null)?.message;
    throw new Error(
      res.status === 401
        ? "Sesi berakhir. Silakan masuk kembali."
        : message || `Gagal memuat data (status ${res.status}).`
    );
  }
  return { status: res.status, data: body as T | null };
}

export async function fetchClassroomFeed(
  token: string,
  classroomId: number | string
): Promise<FeedPost[]> {
  const { data } = await socialRequest(`/api/classrooms/${classroomId}/feed`, token);
  return unwrapList<FeedPost>(data ?? {}, normalizePost);
}

export interface CreateClassroomPostParams {
  type: string;
  title?: string;
  body: string;
  due_at?: string | null;
  max_score?: number | null;
  allow_late?: boolean | null;
  category?: string | null;
  files?: File[];
}

export async function createClassroomPost(
  token: string,
  classroomId: number | string,
  params: CreateClassroomPostParams
): Promise<FeedPost> {
  const formData = new FormData();
  formData.append("type", params.type);
  if (params.title) formData.append("title", params.title);
  formData.append("body", params.body);
  if (params.due_at) formData.append("due_at", params.due_at);
  if (params.max_score != null) {
    formData.append("max_score", String(params.max_score));
  }
  if (params.allow_late != null) {
    formData.append("allow_late", params.allow_late ? "1" : "0");
  }
  if (params.category) formData.append("category", params.category);
  if (params.files) {
    params.files.forEach((file) => {
      formData.append("files[]", file);
    });
  }

  const res = await fetch(`${API_URL}/api/classrooms/${classroomId}/posts`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  let data: Record<string, unknown> | null = null;
  if (res.status !== 204) {
    data = await res.json().catch(() => null);
  }

  if (!res.ok) {
    throw new Error(
      (data as { message?: string } | null)?.message || "Gagal membuat post."
    );
  }

  const created = (data as { data?: unknown } | null)?.data ?? data;
  return normalizePost(created);
}

export async function deleteClassroomPost(
  token: string,
  classroomId: number | string,
  postId: number | string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/classrooms/${classroomId}/posts`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ id: postId }),
  });

  let data: Record<string, unknown> | null = null;
  if (res.status !== 204) {
    data = await res.json().catch(() => null);
  }

  if (!res.ok) {
    throw new Error(
      (data as { message?: string } | null)?.message || "Gagal menghapus post."
    );
  }
}

export async function likePost(
  token: string,
  postId: number
): Promise<LikeResult> {
  const { data } = await socialRequest(`/api/posts/${postId}/like`, token, {
    method: "POST",
  });
  return readLikeResult(data ?? {});
}

export async function fetchPostComments(
  token: string,
  postId: number
): Promise<SocialComment[]> {
  const { data } = await socialRequest(`/api/posts/${postId}/comments`, token);
  return unwrapList<SocialComment>(data ?? {}, normalizeComment);
}

export async function createPostComment(
  token: string,
  postId: number,
  body: string
): Promise<SocialComment> {
  const { data } = await socialRequest(`/api/posts/${postId}/comments`, token, {
    method: "POST",
    body: JSON.stringify({ comment: body, body }),
  });
  const d = (data as { data?: unknown } | null)?.data ?? data;
  return normalizeComment(d);
}

export async function likeComment(
  token: string,
  commentId: number
): Promise<LikeResult> {
  const { data } = await socialRequest(`/api/comments/${commentId}/like`, token, {
    method: "POST",
  });
  return readLikeResult(data ?? {});
}

export async function replyComment(
  token: string,
  commentId: number,
  body: string
): Promise<SocialComment> {
  const { data } = await socialRequest(`/api/comments/${commentId}/reply`, token, {
    method: "POST",
    body: JSON.stringify({ comment: body, body }),
  });
  const d = (data as { data?: unknown } | null)?.data ?? data;
  return normalizeComment(d);
}

export async function deleteComment(
  token: string,
  commentId: number
): Promise<void> {
  await socialRequest<unknown>(`/api/comments/${commentId}`, token, {
    method: "DELETE",
  });
}

export interface LearnCategory {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  modules_count: number;
}

export interface LearnModuleCategory {
  id: number;
  title: string;
  slug: string;
  image_url: string | null;
}

export interface LearnModule {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  is_pro: boolean;
  access_type: string | null;
  sort_order: number;
  embed_ready_url: string | null;
  category: LearnModuleCategory | null;
}

export interface LearnModuleAuthor {
  id: number;
  name: string;
  avatar: string | null;
}

export interface LearnModuleDetail extends LearnModule {
  embed_canva_url: string | null;
  author: LearnModuleAuthor | null;
  created_at: string | null;
  related: LearnModule[];
}

async function learnGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: "application/json" },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (body as { message?: string } | null)?.message ||
        `Gagal memuat data (status ${res.status}).`
    );
  }
  return (body as { data?: T })?.data as T;
}

function normalizeLearnModule(raw: unknown): LearnModule {
  const m = (raw ?? {}) as {
    id?: unknown;
    title?: string;
    slug?: string;
    description?: string | null;
    thumbnail_url?: string | null;
    is_pro?: unknown;
    access_type?: string | null;
    sort_order?: unknown;
    embed_ready_url?: string | null;
    category?: {
      id?: unknown;
      title?: string;
      slug?: string;
      image_url?: string | null;
    } | null;
  } | null;

  return {
    id: Number(m?.id ?? 0),
    title: String(m?.title ?? ""),
    slug: String(m?.slug ?? ""),
    description: m?.description ?? null,
    thumbnail_url: m?.thumbnail_url ?? null,
    is_pro: Boolean(m?.is_pro),
    access_type: m?.access_type ?? null,
    sort_order: Number(m?.sort_order ?? 0),
    embed_ready_url: m?.embed_ready_url ?? null,
    category: m?.category
      ? {
          id: Number(m.category.id ?? 0),
          title: String(m.category.title ?? ""),
          slug: String(m.category.slug ?? ""),
          image_url: m.category.image_url ?? null,
        }
      : null,
  };
}

export async function fetchLearnCategories(): Promise<LearnCategory[]> {
  const data = await learnGet<unknown>("/api/learn/categories");
  const list = Array.isArray(data) ? data : [];
  return list.map((raw) => {
    const c = (raw ?? {}) as {
      id?: unknown;
      title?: string;
      slug?: string;
      description?: string | null;
      image_url?: string | null;
      is_active?: unknown;
      sort_order?: unknown;
      modules_count?: unknown;
    } | null;

    return {
      id: Number(c?.id ?? 0),
      title: String(c?.title ?? ""),
      slug: String(c?.slug ?? ""),
      description: c?.description ?? null,
      image_url: c?.image_url ?? null,
      is_active: Boolean(c?.is_active),
      sort_order: Number(c?.sort_order ?? 0),
      modules_count: Number(c?.modules_count ?? 0),
    };
  });
}

export async function fetchLearnModules(): Promise<LearnModule[]> {
  const data = await learnGet<unknown>("/api/learn/modules?per_page=100");
  const list = Array.isArray(data)
    ? data
    : ((data as { data?: unknown[] } | null)?.data ?? []);
  return list.map(normalizeLearnModule);
}

export async function fetchLearnModule(
  id: number | string
): Promise<LearnModuleDetail> {
  const data =
    (await learnGet<Record<string, unknown>>(`/api/learn/modules/${id}`)) ?? {};
  const base = normalizeLearnModule(data);
  const author = data.author as {
    id?: unknown;
    name?: string;
    avatar?: string | null;
  } | null;
  const relatedRaw = (data.related as { data?: unknown[] } | undefined)?.data;
  const related = Array.isArray(relatedRaw)
    ? relatedRaw.map(normalizeLearnModule)
    : [];

  return {
    ...base,
    embed_canva_url: (data.embed_canva_url as string | null) ?? null,
    author: author
      ? {
          id: Number(author.id ?? 0),
          name: String(author.name ?? ""),
          avatar: author.avatar ?? null,
        }
      : null,
    created_at: (data.created_at as string | null) ?? null,
    related,
  };
}

export interface Plan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  price_formatted: string;
  billing_cycle: string;
  max_assets: number;
  max_storage_mb: number;
  max_classes: number;
  features: string[];
}

export interface PaymentInitiation {
  order_id: string | null;
  amount: number | null;
  status: string | null;
  plan: string | null;
  payment_url: string | null;
  snap_token: string | null;
  expires_at: string | null;
  raw: Record<string, unknown>;
}

export interface PaymentHistoryItem {
  id: number;
  order_id: string;
  plan: { id: number; name: string } | null;
  amount: number;
  status: string;
  payment_type: string | null;
  created_at: string | null;
  paid_at: string | null;
}

function normalizePlan(raw: unknown): Plan {
  const p = (raw ?? {}) as {
    id?: unknown;
    name?: string;
    slug?: string;
    description?: string | null;
    price?: unknown;
    price_formatted?: string;
    billing_cycle?: string;
    max_assets?: unknown;
    max_storage_mb?: unknown;
    max_classes?: unknown;
    features?: unknown;
  } | null;

  return {
    id: Number(p?.id ?? 0),
    name: String(p?.name ?? ""),
    slug: String(p?.slug ?? ""),
    description: p?.description ?? null,
    price: Number(p?.price ?? 0),
    price_formatted: String(p?.price_formatted ?? ""),
    billing_cycle: String(p?.billing_cycle ?? ""),
    max_assets: Number(p?.max_assets ?? 0),
    max_storage_mb: Number(p?.max_storage_mb ?? 0),
    max_classes: Number(p?.max_classes ?? 0),
    features: Array.isArray(p?.features) ? (p?.features as string[]) : [],
  };
}

export async function fetchPlans(): Promise<Plan[]> {
  const data = await learnGet<unknown>("/api/plans");
  const list = Array.isArray(data)
    ? data
    : ((data as { data?: unknown[] } | null)?.data ?? []);
  return list.map(normalizePlan);
}

export async function fetchPlan(slug: string): Promise<Plan> {
  const data = await learnGet<unknown>(`/api/plans/${slug}`);
  return normalizePlan(data);
}

function normalizePaymentHistory(raw: unknown): PaymentHistoryItem {
  const h = (raw ?? {}) as {
    id?: unknown;
    order_id?: string;
    plan?: { id?: unknown; name?: string } | null;
    amount?: unknown;
    gross_amount?: unknown;
    status?: string;
    transaction_status?: string;
    payment_type?: string | null;
    created_at?: string | null;
    paid_at?: string | null;
    settlement_time?: string | null;
  } | null;

  return {
    id: Number(h?.id ?? 0),
    order_id: String(h?.order_id ?? ""),
    plan: h?.plan
      ? { id: Number(h.plan.id ?? 0), name: String(h.plan.name ?? "") }
      : null,
    amount: Number(h?.amount ?? h?.gross_amount ?? 0),
    status: String(h?.status ?? h?.transaction_status ?? ""),
    payment_type: h?.payment_type ?? null,
    created_at: h?.created_at ?? null,
    paid_at: h?.paid_at ?? h?.settlement_time ?? null,
  };
}

export async function fetchPaymentHistory(
  token: string
): Promise<PaymentHistoryItem[]> {
  const { data } = await socialRequest<unknown>("/api/payment/history", token);
  const list = Array.isArray(data)
    ? data
    : ((data as { data?: unknown[] } | null)?.data ?? []);
  return list.map(normalizePaymentHistory);
}

export interface TutorialTeaching {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  badge: string | null;
  grade_level: string | null;
  subject: string | null;
  image: string | null;
  persiapan: string[];
  apa_yang_dipelajari: string | null;
  action_button_text: string | null;
  action_button_url: string | null;
  sort_order: number;
}

export interface TutorialCreation {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  youtube_url: string | null;
  youtube_video_id: string | null;
  embed_youtube_url: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  tags: string | null;
  description: string | null;
  sort_order: number;
}

export interface TutorialCategory {
  id: number;
  type: string;
  tab: string | null;
  title: string;
  slug: string;
  description: string | null;
  sort_order: number;
  teachings: TutorialTeaching[];
  creations: TutorialCreation[];
}

export interface TutorialGroup {
  header_title: string;
  tabs: string[];
  current_tab: string | null;
  categories: TutorialCategory[];
}

export interface TutorialsData {
  ajar: TutorialGroup;
  buat: TutorialGroup;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (item === null || item === undefined ? "" : String(item)))
    .filter((item) => item.length > 0);
}

function normalizeTutorialTeaching(raw: unknown): TutorialTeaching {
  const t = (raw ?? {}) as {
    id?: unknown;
    tutorial_category_id?: unknown;
    title?: string;
    slug?: string;
    badge?: string | null;
    grade_level?: string | null;
    subject?: string | null;
    image?: string | null;
    persiapan?: unknown;
    apa_yang_dipelajari?: string | null;
    action_button_text?: string | null;
    action_button_url?: string | null;
    sort_order?: unknown;
  } | null;

  return {
    id: Number(t?.id ?? 0),
    category_id: Number(t?.tutorial_category_id ?? 0),
    title: String(t?.title ?? ""),
    slug: String(t?.slug ?? ""),
    badge: t?.badge ?? null,
    grade_level: t?.grade_level ?? null,
    subject: t?.subject ?? null,
    image: t?.image ?? null,
    persiapan: toStringArray(t?.persiapan),
    apa_yang_dipelajari: t?.apa_yang_dipelajari ?? null,
    action_button_text: t?.action_button_text ?? null,
    action_button_url: t?.action_button_url ?? null,
    sort_order: Number(t?.sort_order ?? 0),
  };
}

function normalizeTutorialCreation(raw: unknown): TutorialCreation {
  const c = (raw ?? {}) as {
    id?: unknown;
    tutorial_category_id?: unknown;
    title?: string;
    slug?: string;
    youtube_url?: string | null;
    youtube_video_id?: string | null;
    embed_youtube_url?: string | null;
    thumbnail_url?: string | null;
    duration?: string | null;
    tags?: string | null;
    description?: string | null;
    sort_order?: unknown;
  } | null;

  return {
    id: Number(c?.id ?? 0),
    category_id: Number(c?.tutorial_category_id ?? 0),
    title: String(c?.title ?? ""),
    slug: String(c?.slug ?? ""),
    youtube_url: c?.youtube_url ?? null,
    youtube_video_id: c?.youtube_video_id ?? null,
    embed_youtube_url: c?.embed_youtube_url ?? null,
    thumbnail_url: c?.thumbnail_url ?? null,
    duration: c?.duration ?? null,
    tags: c?.tags ?? null,
    description: c?.description ?? null,
    sort_order: Number(c?.sort_order ?? 0),
  };
}

function normalizeTutorialCategory(raw: unknown): TutorialCategory {
  const c = (raw ?? {}) as {
    id?: unknown;
    type?: string;
    tab?: string | null;
    title?: string;
    slug?: string;
    description?: string | null;
    sort_order?: unknown;
    published_teachings?: unknown;
    published_creations?: unknown;
  } | null;

  const teachings = Array.isArray(c?.published_teachings)
    ? (c?.published_teachings as unknown[]).map(normalizeTutorialTeaching)
    : [];
  const creations = Array.isArray(c?.published_creations)
    ? (c?.published_creations as unknown[]).map(normalizeTutorialCreation)
    : [];

  teachings.sort((a, b) => a.sort_order - b.sort_order);
  creations.sort((a, b) => a.sort_order - b.sort_order);

  return {
    id: Number(c?.id ?? 0),
    type: String(c?.type ?? ""),
    tab: c?.tab ?? null,
    title: String(c?.title ?? ""),
    slug: String(c?.slug ?? ""),
    description: c?.description ?? null,
    sort_order: Number(c?.sort_order ?? 0),
    teachings,
    creations,
  };
}

function normalizeTutorialGroup(raw: unknown): TutorialGroup {
  const g = (raw ?? {}) as {
    header_title?: string;
    tabs?: unknown;
    current_tab?: string | null;
    categories?: unknown;
  } | null;

  const categories = Array.isArray(g?.categories)
    ? (g?.categories as unknown[]).map(normalizeTutorialCategory)
    : [];
  categories.sort((a, b) => a.sort_order - b.sort_order);

  return {
    header_title: String(g?.header_title ?? ""),
    tabs: toStringArray(g?.tabs),
    current_tab: g?.current_tab ?? null,
    categories,
  };
}

export async function fetchTutorials(): Promise<TutorialsData> {
  const data =
    (await learnGet<Record<string, unknown>>("/api/tutorials")) ?? {};
  return {
    ajar: normalizeTutorialGroup(data.ajar),
    buat: normalizeTutorialGroup(data.buat),
  };
}

export async function fetchTutorialsByType(
  type: "ajar" | "buat"
): Promise<TutorialGroup> {
  const data =
    (await learnGet<Record<string, unknown>>(`/api/tutorials/${type}`)) ?? {};
  return normalizeTutorialGroup(data);
}

export async function initiatePayment(
  token: string,
  planId: number
): Promise<PaymentInitiation> {
  const { data } = await socialRequest<Record<string, unknown>>(
    "/api/payment/initiate",
    token,
    {
      method: "POST",
      body: JSON.stringify({ plan_id: planId }),
    }
  );

  const rawBody = (data?.data as Record<string, unknown>) ?? data ?? {};
  const candidates: Record<string, unknown>[] = [rawBody];
  for (const key of ["transaction", "payment", "data", "detail"]) {
    const nested = rawBody[key];
    if (nested && typeof nested === "object") {
      candidates.push(nested as Record<string, unknown>);
    }
  }
  const d: Record<string, unknown> = Object.assign({}, ...candidates);

  const pickString = (...keys: string[]): string | null => {
    for (const key of keys) {
      const value = d[key];
      if (typeof value === "string" && value) return value;
    }
    return null;
  };

  const amountRaw = d.amount ?? d.gross_amount ?? d.total;
  const amount =
    amountRaw === undefined || amountRaw === null
      ? null
      : Number(amountRaw);

  return {
    order_id: pickString("order_id", "orderId", "reference_id"),
    amount: Number.isFinite(amount) ? amount : null,
    status: pickString("status", "transaction_status"),
    plan: pickString("plan", "plan_name", "plan_slug"),
    payment_url: pickString(
      "payment_url",
      "redirect_url",
      "snap_redirect_url",
      "url"
    ),
    snap_token: pickString("snap_token", "token"),
    expires_at: pickString("expires_at", "expiry_time", "expired_at"),
    raw: d,
  };
}