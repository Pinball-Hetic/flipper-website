import type { Request, Response } from "express";
import { SetPseudo, InvalidPseudoError, PseudoUnavailableError, PseudoCooldownError, UserNotFoundError } from "../use-cases/SetPseudo";
import { CheckPseudoAvailability } from "../use-cases/CheckPseudoAvailability";
import { PrismaUserRepository } from "../infrastructure/PrismaUserRepository";
import { PrismaScoreRepository } from "../infrastructure/PrismaScoreRepository";
import { checkRateLimit } from "../infrastructure/InMemoryRateLimiter";
import { validatePseudo } from "../domain/Pseudo";
import { resolveSession } from "./resolveSession";

const FORMAT_ERROR = "3 à 20 caractères — lettres, chiffres, underscore uniquement";

export class PseudoController {
  static async set(req: Request, res: Response): Promise<void> {
    const userId = await resolveSession(req);
    if (!userId) {
      res.status(401).json({ error: "Authentification requise" });
      return;
    }

    const { pseudo } = req.body as { pseudo?: unknown };
    if (typeof pseudo !== "string") {
      res.status(400).json({ error: "pseudo requis" });
      return;
    }

    const useCase = new SetPseudo(new PrismaUserRepository(), new PrismaScoreRepository());
    try {
      await useCase.execute(userId, pseudo);
      res.status(200).json({ pseudo });
    } catch (err) {
      if (err instanceof InvalidPseudoError) {
        res.status(400).json({ error: FORMAT_ERROR });
      } else if (err instanceof PseudoUnavailableError) {
        res.status(409).json({ error: err.message });
      } else if (err instanceof PseudoCooldownError) {
        res.status(429).json({ error: err.message });
      } else if (err instanceof UserNotFoundError) {
        res.status(404).json({ error: err.message });
      } else {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  static async check(req: Request, res: Response): Promise<void> {
    const userId = await resolveSession(req);
    if (!userId) {
      res.status(401).json({ error: "Authentification requise" });
      return;
    }

    const value = req.query["value"];
    if (typeof value !== "string" || !value) {
      res.status(400).json({ error: "Paramètre value requis" });
      return;
    }

    try {
      validatePseudo(value);
    } catch (err) {
      if (err instanceof InvalidPseudoError) {
        res.status(400).json({ error: FORMAT_ERROR });
        return;
      }
      throw err;
    }

    const ip = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim()
      ?? req.socket.remoteAddress
      ?? "unknown";

    const { allowed, minutesLeft } = checkRateLimit(ip);
    if (!allowed) {
      res.status(429).json({ error: `Trop de tentatives. Réessaie dans ${minutesLeft} minutes.` });
      return;
    }

    const useCase = new CheckPseudoAvailability(new PrismaUserRepository(), new PrismaScoreRepository());
    try {
      const result = await useCase.execute(value);
      res.json(result);
    } catch (err) {
      console.error("[PseudoController.check]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
