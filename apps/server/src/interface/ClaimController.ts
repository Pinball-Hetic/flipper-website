import type { Request, Response } from "express";
import { ClaimScore, NotFoundError, AlreadyClaimedError, ExpiredCodeError } from "../use-cases/ClaimScore";
import { ValidationError } from "../use-cases/RegisterScore";
import { PrismaPendingScoreRepository } from "../infrastructure/PrismaPendingScoreRepository";
import { PrismaScoreRepository } from "../infrastructure/PrismaScoreRepository";
import { checkRateLimit } from "../infrastructure/InMemoryRateLimiter";
import { resolveSession } from "./resolveSession";

export class ClaimController {
  static async handle(req: Request, res: Response): Promise<void> {
    const ip = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim()
      ?? req.socket.remoteAddress
      ?? "unknown";

    const { allowed, minutesLeft } = checkRateLimit(ip);
    if (!allowed) {
      res.status(429).json({ error: `Trop de tentatives. Réessaie dans ${minutesLeft} minutes.` });
      return;
    }

    const userId = await resolveSession(req);
    if (!userId) {
      res.status(401).json({ error: "Authentification requise" });
      return;
    }

    const useCase = new ClaimScore(
      new PrismaPendingScoreRepository(),
      new PrismaScoreRepository(),
    );

    try {
      const score = await useCase.execute({ claimCode: req.body.claimCode, userId });
      res.status(200).json({
        scoreId: score.id,
        value: score.value,
        machineId: score.machineId,
        claimedAt: score.createdAt,
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400).json({ error: err.message });
      } else if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
      } else if (err instanceof AlreadyClaimedError) {
        res.status(409).json({ error: err.message });
      } else if (err instanceof ExpiredCodeError) {
        res.status(410).json({ error: err.message });
      } else {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}
