import type { Request } from "express";
import { resolveSession } from "./resolveSession";
import { PrismaUserRepository } from "../infrastructure/PrismaUserRepository";

type AdminUser = {
  id: string;
  pseudo: string | null;
  pseudoUpdatedAt: Date | null;
  role: string;
};

export type RequireAdminResult =
  | { ok: true; user: AdminUser }
  | { ok: false; status: 401 | 403 };

export async function requireAdmin(req: Request): Promise<RequireAdminResult> {
  const userId = await resolveSession(req);
  if (!userId) return { ok: false, status: 401 };

  const user = await new PrismaUserRepository().findById(userId);
  if (!user || user.role !== "admin") return { ok: false, status: 403 };

  return { ok: true, user };
}
