import type { Request, Response } from "express";
import { requireAdmin } from "./requireAdmin";

export class AdminController {
  static async ping(req: Request, res: Response): Promise<void> {
    const result = await requireAdmin(req);
    if (!result.ok) {
      const message =
        result.status === 401 ? "Authentification requise" : "Accès réservé aux admins";
      res.status(result.status).json({ error: message });
      return;
    }

    res.status(200).json({ ok: true, role: result.user.role });
  }
}
