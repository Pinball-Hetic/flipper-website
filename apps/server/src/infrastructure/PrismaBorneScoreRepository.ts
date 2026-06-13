import type { BorneScore } from "../domain/BorneScore";
import type { IBorneScoreRepository } from "../domain/IBorneScoreRepository";
import { prisma } from "./prisma";

export class PrismaBorneScoreRepository implements IBorneScoreRepository {
  async save(data: {
    code: string;
    cabinetId: string;
    mapId: string;
    score: number;
    maxCombo?: number;
    maxMultiplier?: number;
    counters?: Record<string, number>;
    durationS?: number;
    playedAt: Date;
    expiresAt: Date;
  }): Promise<BorneScore> {
    const row = await prisma.borneScore.create({ data });
    return this.toDomain(row);
  }

  async findByCode(code: string): Promise<BorneScore | null> {
    const row = await prisma.borneScore.findUnique({ where: { code } });
    return row ? this.toDomain(row) : null;
  }

  async existsByCode(code: string): Promise<boolean> {
    const row = await prisma.borneScore.findUnique({
      where: { code },
      select: { id: true },
    });
    return row !== null;
  }

  async claimByCode(code: string, pseudo: string, claimedAt: Date): Promise<boolean> {
    const result = await prisma.borneScore.updateMany({
      where: { code, claimed: false },
      data: { claimed: true, pseudo, claimedAt },
    });
    return result.count === 1;
  }

  async topByMap(mapId: string, limit: number): Promise<BorneScore[]> {
    const rows = await prisma.borneScore.findMany({
      where: { mapId },
      orderBy: [{ score: "desc" }, { playedAt: "asc" }],
      take: limit,
    });
    return rows.map((r) => this.toDomain(r));
  }

  private toDomain(row: {
    id: string;
    code: string;
    cabinetId: string;
    mapId: string;
    score: number;
    maxCombo: number | null;
    maxMultiplier: number | null;
    counters: unknown;
    durationS: number | null;
    playedAt: Date;
    pseudo: string | null;
    claimed: boolean;
    claimedAt: Date | null;
    expiresAt: Date;
    createdAt: Date;
  }): BorneScore {
    return {
      id: row.id,
      code: row.code,
      cabinetId: row.cabinetId,
      mapId: row.mapId,
      score: row.score,
      maxCombo: row.maxCombo ?? undefined,
      maxMultiplier: row.maxMultiplier ?? undefined,
      counters: row.counters ? (row.counters as Record<string, number>) : undefined,
      durationS: row.durationS ?? undefined,
      playedAt: row.playedAt,
      pseudo: row.pseudo ?? undefined,
      claimed: row.claimed,
      claimedAt: row.claimedAt ?? undefined,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    };
  }
}
