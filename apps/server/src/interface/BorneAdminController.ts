import type { Request, Response } from "express";
import { requireAdmin } from "./requireAdmin";
import { PrismaCheckpointRepository } from "../infrastructure/PrismaCheckpointRepository";
import { CreateBorne } from "../use-cases/CreateBorne";
import { UpdateBorne, CheckpointNotFoundError } from "../use-cases/UpdateBorne";
import { ListBornes } from "../use-cases/ListBornes";
import { GetBorne } from "../use-cases/GetBorne";
import { ValidationError } from "../use-cases/RegisterScore";

function denied(res: Response, status: 401 | 403): void {
  const message =
    status === 401 ? "Authentification requise" : "Accès réservé aux admins";
  res.status(status).json({ error: message });
}

function handleError(res: Response, err: unknown): void {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
  } else if (err instanceof CheckpointNotFoundError) {
    res.status(404).json({ error: err.message });
  } else {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export class BorneAdminController {
  static async create(req: Request, res: Response): Promise<void> {
    const auth = await requireAdmin(req);
    if (!auth.ok) return denied(res, auth.status);

    const useCase = new CreateBorne(new PrismaCheckpointRepository());
    try {
      const result = await useCase.execute({
        name: req.body?.name,
        description: req.body?.description,
        type: req.body?.type,
        address: req.body?.address,
        lat: req.body?.lat,
        lng: req.body?.lng,
        ownerUserId: req.body?.ownerUserId ?? auth.user.id,
      });
      res.status(201).json(result);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async list(req: Request, res: Response): Promise<void> {
    const auth = await requireAdmin(req);
    if (!auth.ok) return denied(res, auth.status);

    const useCase = new ListBornes(new PrismaCheckpointRepository());
    try {
      const bornes = await useCase.execute();
      res.status(200).json(bornes);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async get(req: Request, res: Response): Promise<void> {
    const auth = await requireAdmin(req);
    if (!auth.ok) return denied(res, auth.status);

    const useCase = new GetBorne(new PrismaCheckpointRepository());
    try {
      const borne = await useCase.execute(String(req.params.id));
      res.status(200).json(borne);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    const auth = await requireAdmin(req);
    if (!auth.ok) return denied(res, auth.status);

    const useCase = new UpdateBorne(new PrismaCheckpointRepository());
    try {
      const borne = await useCase.execute({
        id: String(req.params.id),
        name: req.body?.name,
        description: req.body?.description,
        address: req.body?.address,
        lat: req.body?.lat,
        lng: req.body?.lng,
      });
      res.status(200).json(borne);
    } catch (err) {
      handleError(res, err);
    }
  }
}
