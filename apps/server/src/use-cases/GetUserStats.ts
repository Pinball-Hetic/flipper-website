import { z } from "zod";
import type { IScoreRepository } from "../domain/IScoreRepository";
import type { IVisitRepository } from "../domain/IVisitRepository";
import { ValidationError } from "./RegisterScore";

const GetUserStatsSchema = z.object({
  userId: z.string().min(1),
});

export interface UserStats {
  visitCount: number;
  topScore: number | null;
}

export class GetUserStats {
  constructor(
    private scores: IScoreRepository,
    private visits: IVisitRepository,
  ) {}

  async execute(input: { userId: string }): Promise<UserStats> {
    const result = GetUserStatsSchema.safeParse(input);
    if (!result.success) {
      throw new ValidationError(result.error.errors[0]?.message ?? "Invalid input");
    }
    const { userId } = result.data;
    const [visitCount, topScore] = await Promise.all([
      this.visits.countByUser(userId),
      this.scores.findTopByUser(userId),
    ]);
    return { visitCount, topScore };
  }
}
