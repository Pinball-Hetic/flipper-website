import { fetchJson } from "./fetch-json";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8882";

// Toutes les requêtes admin passent par requireAdmin côté serveur : le cookie de
// session DOIT circuler → credentials:"include" sur chaque appel (même origine
// app.flippix via la gateway).
const withCreds = (init?: RequestInit): RequestInit => ({
  ...init,
  credentials: "include",
  headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
});

export interface AdminBorne {
  id: string;
  name: string;
  description?: string;
  type: string;
  address?: string;
  lat: number;
  lng: number;
  cabinetId?: string;
  ownerUserId?: string;
  createdAt: string;
}

export interface CreateBorneBody {
  name: string;
  type?: string;
  description?: string;
  address?: string;
  lat: number;
  lng: number;
}

export interface UpdateBorneBody {
  name?: string;
  description?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface MachineScores {
  id: string;
  name: string;
  checkpointId: string;
  scores: Array<{
    id: string;
    value: number;
    user: { name: string | null; pseudo: string | null } | null;
  }>;
}

export function listBornes(): Promise<AdminBorne[]> {
  return fetchJson<AdminBorne[]>(`${SERVER_URL}/api/admin/bornes`, withCreds());
}

export function getBorne(id: string): Promise<AdminBorne> {
  return fetchJson<AdminBorne>(`${SERVER_URL}/api/admin/bornes/${id}`, withCreds());
}

export function createBorne(
  body: CreateBorneBody,
): Promise<{ checkpoint: AdminBorne; cabinetId: string }> {
  return fetchJson(
    `${SERVER_URL}/api/admin/bornes`,
    withCreds({ method: "POST", body: JSON.stringify(body) }),
  );
}

export function updateBorne(id: string, body: UpdateBorneBody): Promise<AdminBorne> {
  return fetchJson<AdminBorne>(
    `${SERVER_URL}/api/admin/bornes/${id}`,
    withCreds({ method: "PATCH", body: JSON.stringify(body) }),
  );
}

export function issueBorneToken(id: string): Promise<{ token: string }> {
  return fetchJson<{ token: string }>(
    `${SERVER_URL}/api/admin/bornes/${id}/token`,
    withCreds({ method: "POST" }),
  );
}

export async function revokeBorneToken(id: string): Promise<void> {
  const res = await fetch(
    `${SERVER_URL}/api/admin/bornes/${id}/token`,
    withCreds({ method: "DELETE" }),
  );
  if (!res.ok && res.status !== 204) {
    throw new Error(`HTTP ${res.status}`);
  }
}

export function getBorneScores(id: string): Promise<MachineScores[]> {
  return fetchJson<MachineScores[]>(`${SERVER_URL}/api/checkpoints/${id}/scores`);
}
