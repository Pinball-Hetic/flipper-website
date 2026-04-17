import type { IMachineRepository, Machine, MachineWithScores } from "../domain/IMachineRepository";
import { prisma } from "./prisma";

export class PrismaMachineRepository implements IMachineRepository {
  async existsById(id: string): Promise<boolean> {
    const count = await prisma.machine.count({ where: { id } });
    return count > 0;
  }

  async findAll(): Promise<Machine[]> {
    const rows = await prisma.machine.findMany({
      include: { checkpoint: { select: { name: true } } },
      orderBy: { name: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      checkpointId: r.checkpointId,
      checkpointName: r.checkpoint.name,
      createdAt: r.createdAt,
    }));
  }

  async findWithScoresByCheckpoint(checkpointId: string): Promise<MachineWithScores[]> {
    const rows = await prisma.machine.findMany({
      where: { checkpointId },
      include: {
        scores: {
          orderBy: { value: "desc" },
          take: 5,
          include: { user: { select: { name: true } } },
        },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      topScores: r.scores.map((s) => ({
        value: s.value,
        userName: s.user?.name ?? null,
      })),
    }));
  }
}
