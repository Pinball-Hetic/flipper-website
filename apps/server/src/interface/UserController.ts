import type { Request, Response } from "express";
import { GetUserStats } from "../use-cases/GetUserStats";
import { PrismaScoreRepository } from "../infrastructure/PrismaScoreRepository";
import { PrismaVisitRepository } from "../infrastructure/PrismaVisitRepository";
import { ValidationError } from "../use-cases/RegisterScore";

export class UserController {
  static async getStats(req: Request, res: Response): Promise<void> {
    const useCase = new GetUserStats(
      new PrismaScoreRepository(),
      new PrismaVisitRepository(),
    );
    try {
      const stats = await useCase.execute({ userId: req.params.id });
      res.json(stats);
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400).json({ error: err.message });
      } else {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}
