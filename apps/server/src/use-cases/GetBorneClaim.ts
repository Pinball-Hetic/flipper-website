import type { BorneScore } from "../domain/BorneScore";
import type { IBorneScoreRepository } from "../domain/IBorneScoreRepository";

export class BorneNotFoundError extends Error {
  constructor() {
    super("Code de partie invalide ou expiré");
    this.name = "BorneNotFoundError";
  }
}

export class BorneAlreadyClaimedError extends Error {
  constructor() {
    super("Ce score a déjà été réclamé");
    this.name = "BorneAlreadyClaimedError";
  }
}

export class GetBorneClaim {
  constructor(private borneScores: IBorneScoreRepository) {}

  async execute(code: string): Promise<BorneScore> {
    const borne = await this.borneScores.findByCode(code);
    if (!borne) throw new BorneNotFoundError();

    if (borne.claimed) throw new BorneAlreadyClaimedError();

    if (borne.expiresAt < new Date()) throw new BorneNotFoundError();

    return borne;
  }
}
