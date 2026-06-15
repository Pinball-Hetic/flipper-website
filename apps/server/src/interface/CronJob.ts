import { ExpireUnclaimedScores } from "../use-cases/ExpireUnclaimedScores";
import { PrismaPendingScoreRepository } from "../infrastructure/PrismaPendingScoreRepository";
import { PrismaScoreRepository } from "../infrastructure/PrismaScoreRepository";
import { RandomAnonymousNameGenerator } from "../infrastructure/RandomAnonymousNameGenerator";

export function startCron(): void {
  const run = async () => {
    try {
      const useCase = new ExpireUnclaimedScores(
        new PrismaPendingScoreRepository(),
        new PrismaScoreRepository(),
        new RandomAnonymousNameGenerator(),
      );
      const count = await useCase.execute();
      console.log(`[CRON] ${count} scores expirés convertis en anonymes`);
    } catch (err) {
      console.error("[CRON] Erreur lors de l'expiration des scores:", err);
    }
  };

  setInterval(run, 3_600_000);
}
