import type { IPendingScoreRepository } from "../domain/IPendingScoreRepository";
import type { IScoreRepository } from "../domain/IScoreRepository";
import type { IAnonymousNameGenerator } from "../domain/IAnonymousNameGenerator";

export class ExpireUnclaimedScores {
  constructor(
    private pendingScores: IPendingScoreRepository,
    private scores: IScoreRepository,
    private nameGenerator: IAnonymousNameGenerator,
  ) {}

  async execute(): Promise<number> {
    const expired = await this.pendingScores.findExpired();
    if (expired.length === 0) return 0;

    await Promise.all(
      expired.map(async (pending) => {
        const pseudo = this.nameGenerator.generate();
        const score = await this.scores.save({
          value: pending.score,
          machineId: pending.borneId,
          pseudo,
          createdAt: pending.timestamp,
        });
        await this.pendingScores.markExpired(pending.id, score.id);
      }),
    );

    return expired.length;
  }
}
