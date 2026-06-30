import type { Request } from "express";

export async function resolveSession(req: Request): Promise<string | null> {
  const authUrl = process.env.AUTH_URL ?? "http://localhost:8888";

  try {
    const headers: Record<string, string> = {};
    if (req.headers.cookie) headers["cookie"] = req.headers.cookie;
    if (req.headers.authorization) headers["authorization"] = req.headers.authorization;

    const res = await fetch(`${authUrl}/api/auth/get-session`, { headers });
    if (!res.ok) return null;

    const data = (await res.json()) as { user?: { id?: string } } | null;
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}
