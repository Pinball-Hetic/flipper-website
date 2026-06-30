import type { Request, Response } from "express";
import { GetBorneClaim, BorneNotFoundError, BorneAlreadyClaimedError } from "../use-cases/GetBorneClaim";
import {
  ClaimBorneScore,
  BorneExpiredError,
  InvalidPseudoError,
  NoPseudoError,
  UserNotFoundError,
} from "../use-cases/ClaimBorneScore";
import { RecordAccountScore } from "../use-cases/RecordAccountScore";
import { PrismaBorneScoreRepository } from "../infrastructure/PrismaBorneScoreRepository";
import { PrismaUserRepository } from "../infrastructure/PrismaUserRepository";
import { PrismaCheckpointRepository } from "../infrastructure/PrismaCheckpointRepository";
import { PrismaMachineRepository } from "../infrastructure/PrismaMachineRepository";
import { PrismaScoreRepository } from "../infrastructure/PrismaScoreRepository";
import { resolveSession } from "./resolveSession";

import type { BorneScore } from "../domain/BorneScore";

// Pont /v1 → Score : best-effort, ne doit JAMAIS casser la réponse de claim.
async function bridgeAccountScore(borne: BorneScore, userId: string): Promise<void> {
  try {
    const useCase = new RecordAccountScore(
      new PrismaCheckpointRepository(),
      new PrismaMachineRepository(),
      new PrismaScoreRepository(),
    );
    const score = await useCase.execute({
      cabinetId: borne.cabinetId,
      mapId: borne.mapId,
      value: borne.score,
      userId,
      playedAt: borne.playedAt,
    });
    if (!score) {
      console.warn(
        `[V1ClaimController] borne ${borne.cabinetId} non enregistrée — Score non écrit (skip).`,
      );
    }
  } catch (err) {
    console.error("[V1ClaimController] échec du pont RecordAccountScore:", err);
  }
}

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
    const useCase = new ClaimBorneScore(
      new PrismaBorneScoreRepository(),
      new PrismaUserRepository(),
    );

    const userId = await resolveSession(req);

    try {
      const { pseudo, borne } = userId
        ? await useCase.execute(code, { userId })
        : await useCase.execute(code, { pseudo: req.body?.pseudo });

      // Claim PAR COMPTE → matérialise un Score dans les affichages existants.
      // Claim anonyme → aucun Score (reste dans borne_score / leaderboard /v1).
      if (userId) await bridgeAccountScore(borne, userId);

      res.status(200).json({ ok: true, pseudo });
    } catch (err) {
      if (err instanceof NoPseudoError) {
        res.status(409).json({ error: err.message, needsPseudo: true });
      } else if (err instanceof UserNotFoundError) {
        res.status(404).json({ error: err.message });
      } else if (err instanceof InvalidPseudoError) {
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
