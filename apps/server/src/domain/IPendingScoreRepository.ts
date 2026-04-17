import type { PendingScore } from "./PendingScore";

export interface IPendingScoreRepository {
  save(data: {
    gameId: string;
    claimCode: string;
    borneId: string;
    score: number;
    timestamp: Date;
    expiresAt: Date;
  }): Promise<PendingScore>;

  findByCode(claimCode: string): Promise<PendingScore | null>;

  findByGameId(gameId: string): Promise<PendingScore | null>;

  findExpired(): Promise<PendingScore[]>;

  claimIfUnclaimed(id: string): Promise<boolean>;

  markClaimed(id: string, userId: string, finalScoreId: string): Promise<void>;

  markExpired(id: string, finalScoreId: string): Promise<void>;
}
