import type { Request } from "express";
import type { Checkpoint } from "../domain/Checkpoint";
import type { ICheckpointRepository } from "../domain/ICheckpointRepository";
import { requireStaff, type StaffUser } from "./requireStaff";
import { PrismaCheckpointRepository } from "../infrastructure/PrismaCheckpointRepository";

export type RequireBorneAccessResult =
  | { ok: true; user: StaffUser; borne: Checkpoint }
  | { ok: false; status: 401 | 403 | 404 };

// Frontière d'autorisation partagée get/update/token : staff + ownership.
// Un manager ne peut JAMAIS toucher une borne qu'il ne possède pas → 403.
// 404 renvoyé AVANT le check ownership uniquement pour borne inexistante
// (n'expose pas l'ownership d'autrui : un manager reçoit 404, pas 403, sur id inconnu).
export async function requireBorneAccess(
  req: Request,
  borneId: string,
  checkpoints: ICheckpointRepository = new PrismaCheckpointRepository(),
): Promise<RequireBorneAccessResult> {
  const auth = await requireStaff(req);
  if (!auth.ok) return auth;

  const borne = await checkpoints.findById(borneId);
  if (!borne) return { ok: false, status: 404 };

  if (auth.user.role !== "admin" && borne.ownerUserId !== auth.user.id) {
    return { ok: false, status: 403 };
  }

  return { ok: true, user: auth.user, borne };
}
