import type { Request, Response } from "express";
import {
  SubmitPendingScore,
  DuplicateGameError,
} from "../use-cases/SubmitPendingScore";
import { MachineNotFoundError, ValidationError } from "../use-cases/RegisterScore";
import { PrismaPendingScoreRepository } from "../infrastructure/PrismaPendingScoreRepository";
import { PrismaMachineRepository } from "../infrastructure/PrismaMachineRepository";

export class PendingScoreController {
  static async handle(req: Request, res: Response): Promise<void> {
    const apiKey = process.env.BORNE_API_KEY;
    if (!apiKey || req.headers["x-api-key"] !== apiKey) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const useCase = new SubmitPendingScore(
      new PrismaPendingScoreRepository(),
      new PrismaMachineRepository(),
    );

    try {
      const pending = await useCase.execute(req.body);
      res.status(201).json({
        id: pending.id,
        gameId: pending.gameId,
        claimCode: pending.claimCode,
        score: pending.score,
        status: pending.status,
        expiresAt: pending.expiresAt,
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400).json({ error: err.message });
      } else if (err instanceof MachineNotFoundError) {
        res.status(404).json({ error: err.message });
      } else if (err instanceof DuplicateGameError) {
        res.status(409).json({ error: err.message });
      } else {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  static async getByCode(req: Request, res: Response): Promise<void> {
    try {
      const code = String(req.params.code);
      if (!/^[A-Z0-9]{6}$/.test(code)) {
        res.status(404).json({ error: "Code invalide" });
        return;
      }
      const pending = await new PrismaPendingScoreRepository().findByCode(code);

      if (!pending) {
        res.status(404).json({ error: "Code invalide" });
        return;
      }

      if (pending.status !== "UNCLAIMED") {
        res.status(409).json({ error: "Score déjà réclamé ou expiré", status: pending.status });
        return;
      }

      res.json({
        score: pending.score,
        borneId: pending.borneId,
        timestamp: pending.timestamp,
        status: pending.status,
        expiresAt: pending.expiresAt,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
