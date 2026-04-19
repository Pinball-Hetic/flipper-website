import type { Score } from "../domain/Score";
import type { IScoreRepository } from "../domain/IScoreRepository";
import { prisma } from "./prisma";

export class PrismaScoreRepository implements IScoreRepository {
  async save(data: {
    value: number;
    machineId: string;
    pseudo: string;
    createdAt: Date;
  }): Promise<Score> {
    const email = `${data.pseudo.toLowerCase()}@borne.flipper-go.local`;

    const user = await prisma.user.upsert({
      where: { email },
      create: { name: data.pseudo, email, emailVerified: false },
      update: { name: data.pseudo },
    });

    const score = await prisma.score.create({
      data: {
        value: data.value,
        machineId: data.machineId,
        userId: user.id,
        createdAt: data.createdAt,
      },
    });

    return {
      id: score.id,
      value: score.value,
      machineId: score.machineId,
      userId: score.userId,
      createdAt: score.createdAt,
    };
  }

  async saveFromPending(data: {
    value: number;
    machineId: string;
    userId: string;
  }): Promise<Score> {
    const score = await prisma.score.create({
      data: {
        value: data.value,
        machineId: data.machineId,
        userId: data.userId,
      },
    });

    return {
      id: score.id,
      value: score.value,
      machineId: score.machineId,
      userId: score.userId,
      createdAt: score.createdAt,
    };
  }

  async existsRecentScore(machineId: string, pseudo: string, withinSeconds: number): Promise<boolean> {
    const since = new Date(Date.now() - withinSeconds * 1000);
    const count = await prisma.score.count({
      where: {
        machineId,
        createdAt: { gt: since },
        user: { name: { equals: pseudo, mode: "insensitive" } },
      },
    });
    return count > 0;
  }

  async findTopByUser(userId: string): Promise<number | null> {
    const row = await prisma.score.findFirst({
      where: { userId },
      orderBy: { value: "desc" },
      select: { value: true },
    });
    return row?.value ?? null;
  }

  async existsByPseudo(pseudoLower: string): Promise<boolean> {
    const count = await prisma.score.count({
      where: {
        user: {
          pseudoLower: null,
          name: { equals: pseudoLower, mode: "insensitive" },
        },
      },
    });
    return count > 0;
  }
}
