
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://backend-smartagrixr-production.up.railway.app";

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE_URL) return cleanPath;
  return `${API_BASE_URL.replace(/\/$/, "")}${cleanPath}`;
}

export function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Accept": "application/json",
  };

  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("jwt") ||
      sessionStorage.getItem("auth_token") ||
      sessionStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}
