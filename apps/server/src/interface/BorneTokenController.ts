import type { Request, Response } from "express";
import { requireBorneAccess } from "./requireBorneAccess";
import { PrismaCheckpointRepository } from "../infrastructure/PrismaCheckpointRepository";
import { GenerateBorneToken } from "../use-cases/GenerateBorneToken";
import { RevokeBorneToken } from "../use-cases/RevokeBorneToken";
import { CheckpointNotFoundError } from "../use-cases/UpdateBorne";

function denied(res: Response, status: 401 | 403 | 404): void {
  const messages: Record<number, string> = {
    401: "Authentification requise",
    403: "Accès refusé",
    404: "Borne introuvable",
  };
  res.status(status).json({ error: messages[status] });
}

function handleError(res: Response, err: unknown): void {
  if (err instanceof CheckpointNotFoundError) {
    res.status(404).json({ error: err.message });
  } else {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export class BorneTokenController {
  static async issue(req: Request, res: Response): Promise<void> {
    const access = await requireBorneAccess(req, String(req.params.id));
    if (!access.ok) return denied(res, access.status);

    const useCase = new GenerateBorneToken(new PrismaCheckpointRepository());
    try {
      const result = await useCase.execute(String(req.params.id));
      res.status(200).json(result);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async revoke(req: Request, res: Response): Promise<void> {
    const access = await requireBorneAccess(req, String(req.params.id));
    if (!access.ok) return denied(res, access.status);

    const useCase = new RevokeBorneToken(new PrismaCheckpointRepository());
    try {
      await useCase.execute(String(req.params.id));
      res.status(204).end();
    } catch (err) {
      handleError(res, err);
    }
  }
}
