import type { Request, Response } from "express";
import { RegisterScore, MachineNotFoundError, ValidationError, DuplicateScoreError } from "../use-cases/RegisterScore";
import { PrismaScoreRepository } from "../infrastructure/PrismaScoreRepository";
import { PrismaMachineRepository } from "../infrastructure/PrismaMachineRepository";

export class ScoreController {
  static async handle(req: Request, res: Response): Promise<void> {
    const apiKey = process.env.BORNE_API_KEY;
    if (!apiKey || req.headers["x-api-key"] !== apiKey) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const useCase = new RegisterScore(
      new PrismaScoreRepository(),
      new PrismaMachineRepository(),
    );

    try {
      const score = await useCase.execute(req.body);
      res.status(201).json({
        id: score.id,
        value: score.value,
        machineId: score.machineId,
        createdAt: score.createdAt,
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400).json({ error: err.message });
      } else if (err instanceof MachineNotFoundError) {
        res.status(404).json({ error: err.message });
      } else if (err instanceof DuplicateScoreError) {
        res.status(409).json({ error: "Score déjà enregistré. Réessaie dans quelques secondes." });
      } else {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}
