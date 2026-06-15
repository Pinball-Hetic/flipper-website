import type { BorneScore } from "./BorneScore";

export interface IBorneScoreRepository {
  save(data: {
    code: string;
    gameId?: string;
    cabinetId: string;
    mapId: string;
    score: number;
    maxCombo?: number;
    maxMultiplier?: number;
    counters?: Record<string, number>;
    durationS?: number;
    playedAt: Date;
    expiresAt: Date;
  }): Promise<BorneScore>;

  findByCode(code: string): Promise<BorneScore | null>;

  findByGameId(gameId: string): Promise<BorneScore | null>;

  existsByCode(code: string): Promise<boolean>;

  claimByCode(
    code: string,
    pseudo: string,
    claimedAt: Date,
    userId?: string,
  ): Promise<boolean>;

  topByMap(mapId: string, limit: number): Promise<BorneScore[]>;
}
