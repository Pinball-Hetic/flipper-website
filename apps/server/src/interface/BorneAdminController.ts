import type { Request, Response } from "express";
import { requireAdmin } from "./requireAdmin";
import { requireStaff } from "./requireStaff";
import { requireBorneAccess } from "./requireBorneAccess";
import { PrismaCheckpointRepository } from "../infrastructure/PrismaCheckpointRepository";
import { PrismaUserRepository } from "../infrastructure/PrismaUserRepository";
import { CreateBorne } from "../use-cases/CreateBorne";
import { UpdateBorne, CheckpointNotFoundError } from "../use-cases/UpdateBorne";
import { ListBornes } from "../use-cases/ListBornes";
import { AssignBorneOwner } from "../use-cases/AssignBorneOwner";
import { SetUserRole, UserNotFoundError } from "../use-cases/SetUserRole";
import { ListUsers } from "../use-cases/ListUsers";
import { ValidationError } from "../use-cases/RegisterScore";

function denied(res: Response, status: 401 | 403 | 404): void {
  const messages: Record<number, string> = {
    401: "Authentification requise",
    403: "Accès refusé",
    404: "Borne introuvable",
  };
  res.status(status).json({ error: messages[status] });
}

function handleError(res: Response, err: unknown): void {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
  } else if (err instanceof CheckpointNotFoundError || err instanceof UserNotFoundError) {
    res.status(404).json({ error: err.message });
  } else {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export class BorneAdminController {
  // super-admin only
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

  // staff : admin voit tout, manager voit seulement ses bornes
  static async list(req: Request, res: Response): Promise<void> {
    const auth = await requireStaff(req);
    if (!auth.ok) return denied(res, auth.status);

    const useCase = new ListBornes(new PrismaCheckpointRepository());
    try {
      const bornes =
        auth.user.role === "manager"
          ? await useCase.execute({ ownerUserId: auth.user.id })
          : await useCase.execute();
      res.status(200).json(bornes);
    } catch (err) {
      handleError(res, err);
    }
  }

  // staff + ownership
  static async get(req: Request, res: Response): Promise<void> {
    const access = await requireBorneAccess(req, String(req.params.id));
    if (!access.ok) return denied(res, access.status);
    res.status(200).json(access.borne);
  }

  // staff + ownership
  static async update(req: Request, res: Response): Promise<void> {
    const access = await requireBorneAccess(req, String(req.params.id));
    if (!access.ok) return denied(res, access.status);

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

  // super-admin only
  static async assignOwner(req: Request, res: Response): Promise<void> {
    const auth = await requireAdmin(req);
    if (!auth.ok) return denied(res, auth.status);

    const useCase = new AssignBorneOwner(
      new PrismaCheckpointRepository(),
      new PrismaUserRepository(),
    );
    try {
      const ownerUserId = req.body?.ownerUserId ?? null;
      const borne = await useCase.execute(String(req.params.id), ownerUserId);
      res.status(200).json(borne);
    } catch (err) {
      handleError(res, err);
    }
  }

  // super-admin only
  static async listUsers(req: Request, res: Response): Promise<void> {
    const auth = await requireAdmin(req);
    if (!auth.ok) return denied(res, auth.status);

    const useCase = new ListUsers(new PrismaUserRepository());
    try {
      const users = await useCase.execute();
      res.status(200).json(users);
    } catch (err) {
      handleError(res, err);
    }
  }

  // super-admin only
  static async setUserRole(req: Request, res: Response): Promise<void> {
    const auth = await requireAdmin(req);
    if (!auth.ok) return denied(res, auth.status);

    const useCase = new SetUserRole(new PrismaUserRepository());
    try {
      await useCase.execute(String(req.params.id), req.body?.role);
      res.status(200).json({ ok: true });
    } catch (err) {
      handleError(res, err);
    }
  }
}
