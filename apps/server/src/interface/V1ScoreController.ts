import type { Request, Response } from "express";
import { RegisterBorneScore } from "../use-cases/RegisterBorneScore";
import { ValidationError } from "../use-cases/RegisterScore";
import { PrismaBorneScoreRepository } from "../infrastructure/PrismaBorneScoreRepository";
import { resolveBorne } from "./borneAuth";

export class V1ScoreController {
  static async create(req: Request, res: Response): Promise<void> {
    const borne = await resolveBorne(req);
    if (!borne) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Token par borne → cabinetId serveur-autoritaire (ignore le body).
    // Legacy CABINET_KEY → cabinetId pris du body comme avant.
    const input =
      borne.cabinetId !== null
        ? { ...req.body, cabinetId: borne.cabinetId }
        : req.body;

    const useCase = new RegisterBorneScore(new PrismaBorneScoreRepository());

    try {
      const { borne: borneScore, created } = await useCase.execute(input);
      const baseUrl = process.env.CLAIM_BASE_URL ?? "http://localhost:8888";
      res.status(created ? 201 : 200).json({
        scoreId: borneScore.id,
        code: borneScore.code,
        claimUrl: `${baseUrl}/claim/${borneScore.code}`,
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
