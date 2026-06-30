import type { Request } from "express";
import { resolveSession } from "./resolveSession";
import { PrismaUserRepository } from "../infrastructure/PrismaUserRepository";

export type StaffUser = {
  id: string;
  pseudo: string | null;
  pseudoUpdatedAt: Date | null;
  role: string;
};

export type RequireStaffResult =
  | { ok: true; user: StaffUser }
  | { ok: false; status: 401 | 403 };

// Autorise role "admin" OU "manager". requireAdmin reste pour les actions super-admin.
export async function requireStaff(req: Request): Promise<RequireStaffResult> {
  const userId = await resolveSession(req);
  if (!userId) return { ok: false, status: 401 };

  const user = await new PrismaUserRepository().findById(userId);
  if (!user || (user.role !== "admin" && user.role !== "manager")) {
    return { ok: false, status: 403 };
  }

  return { ok: true, user };
}
