import { randomInt } from "crypto";
import { z } from "zod";
import type { BorneScore } from "../domain/BorneScore";
import type { IBorneScoreRepository } from "../domain/IBorneScoreRepository";
import { ValidationError } from "./RegisterScore";

export class CodeGenerationError extends Error {
  constructor() {
    super("Impossible de générer un code unique");
    this.name = "CodeGenerationError";
  }
}

const RegisterBorneScoreSchema = z.object({
  gameId: z.string().uuid().optional(),
  cabinetId: z.string().min(1),
  mapId: z.string().min(1),
  score: z.number().int().min(1).max(99_999_999),
  maxCombo: z.number().int().min(0).optional(),
  maxMultiplier: z.number().int().min(0).optional(),
  counters: z.record(z.string(), z.number().int()).optional(),
  durationS: z.number().int().min(0).optional(),
  playedAt: z.string().datetime({ offset: true }),
});

export type RegisterBorneScoreInput = z.input<typeof RegisterBorneScoreSchema>;

export interface RegisterBorneScoreResult {
  borne: BorneScore;
  created: boolean;
}

const MAX_CODE_ATTEMPTS = 10;
const CLAIM_WINDOW_MS = 24 * 60 * 60 * 1000;

function generateCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

function isUniqueConstraintError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";
}

export class RegisterBorneScore {
  constructor(private borneScores: IBorneScoreRepository) {}

  async execute(input: RegisterBorneScoreInput): Promise<RegisterBorneScoreResult> {
    const result = RegisterBorneScoreSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError(result.error.errors[0]?.message ?? "Invalid input");
    }

    const data = result.data;

    if (data.gameId) {
      const existing = await this.borneScores.findByGameId(data.gameId);
      if (existing) return { borne: existing, created: false };
    }

    const code = await this.allocateCode();

    const playedAt = new Date(data.playedAt);
    const expiresAt = new Date(playedAt.getTime() + CLAIM_WINDOW_MS);

    try {
      const borne = await this.borneScores.save({
        code,
        gameId: data.gameId,
        cabinetId: data.cabinetId,
        mapId: data.mapId,
        score: data.score,
        maxCombo: data.maxCombo,
        maxMultiplier: data.maxMultiplier,
        counters: data.counters,
        durationS: data.durationS,
        playedAt,
        expiresAt,
      });
      return { borne, created: true };
    } catch (err) {
      if (data.gameId && isUniqueConstraintError(err)) {
        const existing = await this.borneScores.findByGameId(data.gameId);
        if (existing) return { borne: existing, created: false };
      }
      throw err;
    }
  }

  private async allocateCode(): Promise<string> {
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      const code = generateCode();
      const exists = await this.borneScores.existsByCode(code);
      if (!exists) return code;
    }
    throw new CodeGenerationError();
  }
}
