import { z } from "zod";
import type { Score } from "../domain/Score";
import type { IPendingScoreRepository } from "../domain/IPendingScoreRepository";
import type { IScoreRepository } from "../domain/IScoreRepository";
import { ValidationError } from "./RegisterScore";

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class AlreadyClaimedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AlreadyClaimedError";
  }
}

export class ExpiredCodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExpiredCodeError";
  }
}

const ClaimScoreSchema = z.object({
  claimCode: z.string().regex(/^[A-Z0-9]{6}$/, "claimCode must be 6 uppercase alphanumeric chars"),
  userId: z.string().min(1),
});

export type ClaimScoreInput = z.input<typeof ClaimScoreSchema>;

export class ClaimScore {
  constructor(
    private pendingScores: IPendingScoreRepository,
    private scores: IScoreRepository,
  ) {}

  async execute(input: ClaimScoreInput): Promise<Score> {
    const result = ClaimScoreSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError(result.error.errors[0]?.message ?? "Invalid input");
    }

    const { claimCode, userId } = result.data;

    const pending = await this.pendingScores.findByCode(claimCode);
    if (!pending) throw new NotFoundError("Code de partie invalide");

    if (pending.status === "EXPIRED" || pending.expiresAt < new Date()) {
      throw new ExpiredCodeError("Ce code de partie a expiré");
    }

    const claimed = await this.pendingScores.claimIfUnclaimed(pending.id);
    if (!claimed) throw new AlreadyClaimedError("Ce score a déjà été réclamé");

    const score = await this.scores.saveFromPending({
      value: pending.score,
      machineId: pending.borneId,
      userId,
    });

    await this.pendingScores.markClaimed(pending.id, userId, score.id);

    return score;
  }
}
