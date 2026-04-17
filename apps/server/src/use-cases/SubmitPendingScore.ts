import { randomInt } from "crypto";
import { z } from "zod";
import type { PendingScore } from "../domain/PendingScore";
import type { IPendingScoreRepository } from "../domain/IPendingScoreRepository";
import type { IMachineRepository } from "../domain/IMachineRepository";
import { MachineNotFoundError, ValidationError } from "./RegisterScore";

export class DuplicateGameError extends Error {
  constructor(gameId: string) {
    super(`Game already submitted: ${gameId}`);
    this.name = "DuplicateGameError";
  }
}

const SubmitPendingScoreSchema = z.object({
  gameId: z.string().uuid(),
  borneId: z.string().min(1),
  score: z.number().int().min(1).max(99_999_999),
  timestamp: z.string().datetime({ offset: true }),
});

export type SubmitPendingScoreInput = z.input<typeof SubmitPendingScoreSchema>;

const CLAIM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateClaimCode(): string {
  return Array.from({ length: 6 }, () =>
    CLAIM_CODE_CHARS[randomInt(CLAIM_CODE_CHARS.length)],
  ).join("");
}

export class SubmitPendingScore {
  constructor(
    private pendingScores: IPendingScoreRepository,
    private machines: IMachineRepository,
  ) {}

  async execute(input: SubmitPendingScoreInput): Promise<PendingScore> {
    const result = SubmitPendingScoreSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError(result.error.errors[0]?.message ?? "Invalid input");
    }

    const { gameId, borneId, score, timestamp } = result.data;

    const machineExists = await this.machines.existsById(borneId);
    if (!machineExists) throw new MachineNotFoundError(borneId);

    const existing = await this.pendingScores.findByGameId(gameId);
    if (existing) throw new DuplicateGameError(gameId);

    const claimCode = generateClaimCode();
    const ts = new Date(timestamp);
    const expiresAt = new Date(ts.getTime() + 24 * 60 * 60 * 1000);

    return this.pendingScores.save({ gameId, claimCode, borneId, score, timestamp: ts, expiresAt });
  }
}
