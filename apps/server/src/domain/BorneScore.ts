export interface BorneScore {
  id: string;
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
  pseudo?: string;
  claimed: boolean;
  claimedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  pseudo: string | null;
  score: number;
  claimed: boolean;
  playedAt: Date;
}
