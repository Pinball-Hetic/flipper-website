import { createHash } from "crypto";
import type { Request } from "express";
import { PrismaCheckpointRepository } from "../infrastructure/PrismaCheckpointRepository";

let legacyWarned = false;

function parseBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

// Résout la borne émettrice d'une requête /v1.
// - token par borne (recommandé) → { cabinetId: <celui de la borne> } (serveur-autoritaire)
// - CABINET_KEY/BORNE_API_KEY partagée (LEGACY, déprécié) → { cabinetId: null } (cabinetId pris du body)
// - sinon → null (401)
export async function resolveBorne(
  req: Request,
): Promise<{ cabinetId: string | null } | null> {
  const token = parseBearer(req);
  if (!token) return null;

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const checkpoint = await new PrismaCheckpointRepository().findByTokenHash(tokenHash);
  if (checkpoint) return { cabinetId: checkpoint.cabinetId ?? null };

  const legacyKey = process.env.CABINET_KEY ?? process.env.BORNE_API_KEY;
  if (legacyKey && token === legacyKey) {
    if (!legacyWarned) {
      console.warn(
        "[borneAuth] CABINET_KEY partagée dépréciée — migrer vers un token par borne (POST /api/admin/bornes/:id/token).",
      );
      legacyWarned = true;
    }
    return { cabinetId: null };
  }

  return null;
}
