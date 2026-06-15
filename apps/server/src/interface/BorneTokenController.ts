import type { Request, Response } from "express";
import { requireAdmin } from "./requireAdmin";
import { PrismaCheckpointRepository } from "../infrastructure/PrismaCheckpointRepository";
import { GenerateBorneToken } from "../use-cases/GenerateBorneToken";
import { RevokeBorneToken } from "../use-cases/RevokeBorneToken";
import { CheckpointNotFoundError } from "../use-cases/UpdateBorne";

function denied(res: Response, status: 401 | 403): void {
  const message =
    status === 401 ? "Authentification requise" : "Accès réservé aux admins";
  res.status(status).json({ error: message });
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
    const auth = await requireAdmin(req);
    if (!auth.ok) return denied(res, auth.status);

    const useCase = new GenerateBorneToken(new PrismaCheckpointRepository());
    try {
      const result = await useCase.execute(String(req.params.id));
      res.status(200).json(result);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async revoke(req: Request, res: Response): Promise<void> {
    const auth = await requireAdmin(req);
    if (!auth.ok) return denied(res, auth.status);

    const useCase = new RevokeBorneToken(new PrismaCheckpointRepository());
    try {
      await useCase.execute(String(req.params.id));
      res.status(204).end();
    } catch (err) {
      handleError(res, err);
    }
  }
}
