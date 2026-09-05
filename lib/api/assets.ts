import { getApiUrl, getAuthHeaders } from "./config";

export interface AssetCategory {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
  created_at?: string;
}

export interface CloudAsset {
  id: string | number;
  name: string;
  category_id?: string | number | null;
  category?: AssetCategory | string | null;
  file_url?: string;
  url?: string;
  thumbnail_url?: string;
  type?: "glb" | "gltf" | "image" | "video" | "audio" | string;
  file_size?: number | string;
  description?: string;
  created_at?: string;
}

export interface FetchAssetsParams {
  category_id?: string | number;
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}

/**
 * 1. Fetch real list of asset categories: GET /api/asset-categories
 */
export async function fetchAssetCategories(): Promise<AssetCategory[]> {
  try {
    const url = getApiUrl("/api/asset-categories");
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.categories)) return data.categories;
    return [];
  } catch (error) {
    console.warn("Could not reach /api/asset-categories:", error);
    return [];
  }
}

/**
 * 2. Create asset category: POST /api/asset-categories
 */
export async function createAssetCategory(payload: { name: string; description?: string }): Promise<AssetCategory> {
  const url = getApiUrl("/api/asset-categories");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create category: ${errText || response.statusText}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * 3. Fetch real cloud assets: GET /api/assets
 */
export async function fetchAssets(params?: FetchAssetsParams): Promise<CloudAsset[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category_id && params.category_id !== "all") {
      query.append("category_id", String(params.category_id));
    }
    if (params?.search) {
      query.append("search", params.search);
    }
    if (params?.type && params.type !== "all") {
      query.append("type", params.type);
    }

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const url = getApiUrl(`/api/assets${queryString}`);

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    let assetList: CloudAsset[] = [];

    if (Array.isArray(data)) assetList = data;
    else if (Array.isArray(data.data)) assetList = data.data;
    else if (Array.isArray(data.assets)) assetList = data.assets;

    return assetList;
  } catch (error) {
    console.warn("Could not reach /api/assets:", error);
    return [];
  }
}

/**
 * 4. Upload asset to cloud storage: POST /api/assets
 */
export async function uploadAsset(
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<CloudAsset> {
  const url = getApiUrl("/api/assets");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
    }
    xhr.setRequestHeader("Accept", "application/json");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res.data || res);
        } catch {
          resolve({
            id: "asset_" + Date.now(),
            name: (formData.get("name") as string) || "Uploaded Asset",
            file_url: (formData.get("file") as File)?.name || "",
            type: "glb",
          });
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText || xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during asset upload. Check server connection."));
    };

    xhr.send(formData);
  });
}

/**
 * 5. Get asset details / URL: GET /api/assets/{id}
 */
export async function getAssetDetails(id: string | number): Promise<CloudAsset> {
  const url = getApiUrl(`/api/assets/${id}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get asset details: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * 6. Delete asset from cloud storage: DELETE /api/assets/{id}
 */
export async function deleteAsset(id: string | number): Promise<boolean> {
  const url = getApiUrl(`/api/assets/${id}`);
  const response = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete asset: ${response.statusText}`);
  }

  return true;
}

/**
 * Helper to resolve full asset download/stream URL
 */
export function resolveAssetFileUrl(asset: CloudAsset): string {
  const rawUrl = asset.file_url || asset.url || "";
  if (!rawUrl) return "";
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("blob:") || rawUrl.startsWith("data:")) {
    return rawUrl;
  }
  return getApiUrl(rawUrl);
}
