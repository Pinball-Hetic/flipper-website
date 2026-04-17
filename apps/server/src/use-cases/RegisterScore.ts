import { z } from "zod";
import type { Score } from "../domain/Score";
import type { IScoreRepository } from "../domain/IScoreRepository";
import type { IMachineRepository } from "../domain/IMachineRepository";

export class MachineNotFoundError extends Error {
  constructor(id: string) {
    super(`Machine not found: ${id}`);
    this.name = "MachineNotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class DuplicateScoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicateScoreError";
  }
}

const RegisterScoreSchema = z.object({
  borneId: z.string().min(1),
  pseudo: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Pseudo must be alphanumeric or underscores"),
  score: z.number().int().min(1).max(99_999_999),
  timestamp: z
    .string()
    .datetime({ offset: true })
    .optional()
    .transform((v) => (v ? new Date(v) : new Date())),
});

export type RegisterScoreInput = z.input<typeof RegisterScoreSchema>;

export class RegisterScore {
  constructor(
    private scores: IScoreRepository,
    private machines: IMachineRepository,
  ) {}

  async execute(input: RegisterScoreInput): Promise<Score> {
    const result = RegisterScoreSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError(result.error.errors[0]?.message ?? "Invalid input");
    }

    const { borneId, pseudo, score, timestamp } = result.data;

    const exists = await this.machines.existsById(borneId);
    if (!exists) throw new MachineNotFoundError(borneId);

    const isDuplicate = await this.scores.existsRecentScore(borneId, pseudo, 60);
    if (isDuplicate) throw new DuplicateScoreError("Score déjà enregistré pour cette partie");

    return this.scores.save({
      value: score,
      machineId: borneId,
      pseudo,
      createdAt: timestamp,
    });
  }
}
