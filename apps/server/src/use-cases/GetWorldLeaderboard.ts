import { z } from "zod";
import type { LeaderboardEntry } from "../domain/BorneScore";
import type { IBorneScoreRepository } from "../domain/IBorneScoreRepository";
import { ValidationError } from "./RegisterScore";

const GetWorldLeaderboardSchema = z.object({
  mapId: z.string().min(1),
  scope: z.enum(["world"]).default("world"),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export interface GetWorldLeaderboardInput {
  mapId: string;
  scope?: "world";
  limit?: string | number;
}

export class GetWorldLeaderboard {
  constructor(private borneScores: IBorneScoreRepository) {}

  async execute(input: GetWorldLeaderboardInput): Promise<LeaderboardEntry[]> {
    const result = GetWorldLeaderboardSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError(result.error.errors[0]?.message ?? "Invalid input");
    }

    const { mapId, limit } = result.data;

    const rows = await this.borneScores.topByMap(mapId, limit);

    return rows.map((row, index) => ({
      rank: index + 1,
      pseudo: row.claimed ? (row.pseudo ?? null) : null,
      score: row.score,
      claimed: row.claimed,
      playedAt: row.playedAt,
    }));
  }
}
