export type PendingScoreStatus = "UNCLAIMED" | "CLAIMED" | "EXPIRED";

export interface PendingScore {
  id: string;
  gameId: string;
  claimCode: string;
  borneId: string;
  score: number;
  timestamp: Date;
  expiresAt: Date;
  status: PendingScoreStatus;
  claimedAt?: Date;
  claimedBy?: string;
  finalScoreId?: string;
}
