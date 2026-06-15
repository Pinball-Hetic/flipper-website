import { createHash } from "crypto";
import type { Request, Response } from "express";
import { GetWorldLeaderboard } from "../use-cases/GetWorldLeaderboard";
import { ValidationError } from "../use-cases/RegisterScore";
import { PrismaBorneScoreRepository } from "../infrastructure/PrismaBorneScoreRepository";

export class V1LeaderboardController {
  static async get(req: Request, res: Response): Promise<void> {
    const useCase = new GetWorldLeaderboard(new PrismaBorneScoreRepository());

    try {
      const entries = await useCase.execute({
        mapId: req.query.mapId as string,
        scope: req.query.scope as "world" | undefined,
        limit: req.query.limit as string | undefined,
      });

      const payload = JSON.stringify({ entries });
      const etag = `"${createHash("sha1").update(payload).digest("hex")}"`;

      if (req.headers["if-none-match"] === etag) {
        res.status(304).end();
        return;
      }

      res.setHeader("ETag", etag);
      res.status(200).json({ entries });
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
