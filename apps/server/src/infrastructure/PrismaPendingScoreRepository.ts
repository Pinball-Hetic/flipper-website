import type { PendingScore } from "../domain/PendingScore";
import type { IPendingScoreRepository } from "../domain/IPendingScoreRepository";
import { prisma } from "./prisma";

export class PrismaPendingScoreRepository implements IPendingScoreRepository {
  async save(data: {
    gameId: string;
    claimCode: string;
    borneId: string;
    score: number;
    timestamp: Date;
    expiresAt: Date;
  }): Promise<PendingScore> {
    const row = await prisma.pendingScore.create({ data });
    return this.toDomain(row);
  }

  async findByCode(claimCode: string): Promise<PendingScore | null> {
    const row = await prisma.pendingScore.findUnique({ where: { claimCode } });
    return row ? this.toDomain(row) : null;
  }

  async findByGameId(gameId: string): Promise<PendingScore | null> {
    const row = await prisma.pendingScore.findUnique({ where: { gameId } });
    return row ? this.toDomain(row) : null;
  }

  async findExpired(): Promise<PendingScore[]> {
    const rows = await prisma.pendingScore.findMany({
      where: {
        status: "UNCLAIMED",
        expiresAt: { lt: new Date() },
      },
      take: 500,
    });
    return rows.map((r) => this.toDomain(r));
  }

  async claimIfUnclaimed(id: string): Promise<boolean> {
    const result = await prisma.pendingScore.updateMany({
      where: { id, status: "UNCLAIMED" },
      data: { status: "CLAIMED" },
    });
    return result.count === 1;
  }

  async markClaimed(id: string, userId: string, finalScoreId: string): Promise<void> {
    await prisma.pendingScore.update({
      where: { id },
      data: {
        status: "CLAIMED",
        claimedAt: new Date(),
        claimedBy: userId,
        finalScoreId,
      },
    });
  }

  async markExpired(id: string, finalScoreId: string): Promise<void> {
    await prisma.pendingScore.update({
      where: { id },
      data: { status: "EXPIRED", finalScoreId },
    });
  }

  private toDomain(row: {
    id: string;
    gameId: string;
    claimCode: string;
    borneId: string;
    score: number;
    timestamp: Date;
    expiresAt: Date;
    status: string;
    claimedAt: Date | null;
    claimedBy: string | null;
    finalScoreId: string | null;
  }): PendingScore {
    return {
      id: row.id,
      gameId: row.gameId,
      claimCode: row.claimCode,
      borneId: row.borneId,
      score: row.score,
      timestamp: row.timestamp,
      expiresAt: row.expiresAt,
      status: row.status as PendingScore["status"],
      claimedAt: row.claimedAt ?? undefined,
      claimedBy: row.claimedBy ?? undefined,
      finalScoreId: row.finalScoreId ?? undefined,
    };
  }
}
