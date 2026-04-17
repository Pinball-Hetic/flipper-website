import type { Request, Response } from "express";
import { GetCheckpointScores } from "../use-cases/GetCheckpointScores";
import { PrismaMachineRepository } from "../infrastructure/PrismaMachineRepository";
import { ValidationError } from "../use-cases/RegisterScore";

export class CheckpointController {
  static async getScores(req: Request, res: Response): Promise<void> {
    const useCase = new GetCheckpointScores(new PrismaMachineRepository());
    try {
      const scoreboard = await useCase.execute({ checkpointId: req.params.id });
      res.json(scoreboard);
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
