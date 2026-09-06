import { getApiUrl, getAuthHeaders } from "./config";

export interface ProjectData {
  id?: string | number;
  name: string;
  description?: string;
  thumbnail_url?: string;
  scene_data?: any;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * 1. Create project: POST /api/projects
 */
export async function createProject(payload: Partial<ProjectData>): Promise<ProjectData> {
  const url = getApiUrl("/api/projects");
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
    throw new Error(`Failed to create project: ${errText || response.statusText}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * 2. Fetch list of projects: GET /api/projects
 */
export async function fetchProjects(): Promise<ProjectData[]> {
  try {
    const url = getApiUrl("/api/projects");
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
    if (Array.isArray(data.projects)) return data.projects;
    return [];
  } catch (error) {
    console.warn("Could not reach /api/projects:", error);
    return [];
  }
}

/**
 * 3. Get single project: GET /api/projects/{id}
 */
export async function getProject(id: string | number): Promise<ProjectData> {
  const url = getApiUrl(`/api/projects/${id}`);
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get project: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * 4. Update project: PUT /api/projects/{id} or POST /api/projects/{id}
 */
export async function updateProject(id: string | number, payload: Partial<ProjectData>): Promise<ProjectData> {
  const url = getApiUrl(`/api/projects/${id}`);
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to update project: ${errText || response.statusText}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * 5. Delete project: DELETE /api/projects/{id}
 */
export async function deleteProject(id: string | number): Promise<boolean> {
  const url = getApiUrl(`/api/projects/${id}`);
  const response = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete project: ${response.statusText}`);
  }

  return true;
}
