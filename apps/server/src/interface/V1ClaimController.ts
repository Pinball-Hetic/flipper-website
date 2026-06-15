import type { Request, Response } from "express";
import { GetBorneClaim, BorneNotFoundError, BorneAlreadyClaimedError } from "../use-cases/GetBorneClaim";
import { ClaimBorneScore, BorneExpiredError, InvalidPseudoError } from "../use-cases/ClaimBorneScore";
import { PrismaBorneScoreRepository } from "../infrastructure/PrismaBorneScoreRepository";

export class V1ClaimController {
  static async get(req: Request, res: Response): Promise<void> {
    const code = String(req.params.code);
    const useCase = new GetBorneClaim(new PrismaBorneScoreRepository());

    try {
      const borne = await useCase.execute(code);
      res.status(200).json({
        score: borne.score,
        mapId: borne.mapId,
        playedAt: borne.playedAt,
        claimed: borne.claimed,
        pseudo: borne.pseudo ?? null,
      });
    } catch (err) {
      if (err instanceof BorneAlreadyClaimedError) {
        res.status(409).json({ error: err.message });
      } else if (err instanceof BorneNotFoundError) {
        res.status(404).json({ error: err.message });
      } else {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  static async claim(req: Request, res: Response): Promise<void> {
    const code = String(req.params.code);
    const useCase = new ClaimBorneScore(new PrismaBorneScoreRepository());

    try {
      const pseudo = await useCase.execute(code, req.body);
      res.status(200).json({ ok: true, pseudo });
    } catch (err) {
      if (err instanceof InvalidPseudoError) {
        res.status(400).json({ error: err.message });
      } else if (err instanceof BorneAlreadyClaimedError) {
        res.status(409).json({ error: err.message });
      } else if (err instanceof BorneExpiredError) {
        res.status(410).json({ error: err.message });
      } else if (err instanceof BorneNotFoundError) {
        res.status(404).json({ error: err.message });
      } else {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}
