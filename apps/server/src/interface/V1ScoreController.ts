import type { Request, Response } from "express";
import { RegisterBorneScore } from "../use-cases/RegisterBorneScore";
import { ValidationError } from "../use-cases/RegisterScore";
import { PrismaBorneScoreRepository } from "../infrastructure/PrismaBorneScoreRepository";
import { checkBearer } from "./v1Auth";

export class V1ScoreController {
  static async create(req: Request, res: Response): Promise<void> {
    if (!checkBearer(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const useCase = new RegisterBorneScore(new PrismaBorneScoreRepository());

    try {
      const borne = await useCase.execute(req.body);
      const baseUrl = process.env.CLAIM_BASE_URL ?? "http://localhost:8888";
      res.status(201).json({
        scoreId: borne.id,
        code: borne.code,
        claimUrl: `${baseUrl}/?code=${borne.code}`,
      });
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
