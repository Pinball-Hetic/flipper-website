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
      mapId: r.mapId ?? undefined,
      checkpointId: r.checkpointId,
      checkpointName: r.checkpoint.name,
      createdAt: r.createdAt,
    }));
  }

  async findByCheckpointAndMapId(
    checkpointId: string,
    mapId: string,
  ): Promise<Machine | null> {
    const row = await prisma.machine.findFirst({
      where: { checkpointId, mapId },
      include: { checkpoint: { select: { name: true } } },
    });
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      mapId: row.mapId ?? undefined,
      checkpointId: row.checkpointId,
      checkpointName: row.checkpoint.name,
      createdAt: row.createdAt,
    };
  }

  async create(data: {
    checkpointId: string;
    name: string;
    mapId: string;
  }): Promise<Machine> {
    const row = await prisma.machine.create({
      data,
      include: { checkpoint: { select: { name: true } } },
    });
    return {
      id: row.id,
      name: row.name,
      mapId: row.mapId ?? undefined,
      checkpointId: row.checkpointId,
      checkpointName: row.checkpoint.name,
      createdAt: row.createdAt,
    };
  }

  async findWithScoresByCheckpoint(checkpointId: string): Promise<MachineWithScores[]> {
    const rows = await prisma.machine.findMany({
      where: { checkpointId },
      include: {
        scores: {
          orderBy: { value: "desc" },
          take: 5,
          include: { user: { select: { name: true, pseudo: true } } },
        },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      checkpointId: r.checkpointId,
      scores: r.scores.map((s) => ({
        id: s.id,
        value: s.value,
        user: s.user ? { name: s.user.name, pseudo: s.user.pseudo } : null,
      })),
    }));
  }
}
