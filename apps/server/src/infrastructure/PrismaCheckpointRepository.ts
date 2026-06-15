import type { Checkpoint } from "../domain/Checkpoint";
import type {
  ICheckpointRepository,
  CreateCheckpointData,
  UpdateCheckpointData,
} from "../domain/ICheckpointRepository";
import { prisma } from "./prisma";

export class PrismaCheckpointRepository implements ICheckpointRepository {
  // Note : la colonne PostGIS `location` (geography) n'est PAS écrite ici —
  // Prisma ne sait pas la requêter. Pour la carte, lat/lng (Float) suffisent.
  async create(data: CreateCheckpointData): Promise<Checkpoint> {
    const row = await prisma.checkpoint.create({ data });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateCheckpointData): Promise<Checkpoint> {
    const row = await prisma.checkpoint.update({ where: { id }, data });
    return this.toDomain(row);
  }

  async findById(id: string): Promise<Checkpoint | null> {
    const row = await prisma.checkpoint.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByCabinetId(cabinetId: string): Promise<Checkpoint | null> {
    const row = await prisma.checkpoint.findUnique({ where: { cabinetId } });
    return row ? this.toDomain(row) : null;
  }

  // toDomain ne mappe pas tokenHash → le hash ne fuite jamais dans l'entité.
  async findByTokenHash(tokenHash: string): Promise<Checkpoint | null> {
    const row = await prisma.checkpoint.findUnique({ where: { tokenHash } });
    return row ? this.toDomain(row) : null;
  }

  async setToken(
    id: string,
    tokenHash: string | null,
    tokenCreatedAt: Date | null,
  ): Promise<void> {
    await prisma.checkpoint.update({
      where: { id },
      data: { tokenHash, tokenCreatedAt },
    });
  }

  async setOwner(id: string, ownerUserId: string | null): Promise<void> {
    await prisma.checkpoint.update({
      where: { id },
      data: { ownerUserId },
    });
  }

  async list(opts: { ownerUserId?: string }): Promise<Checkpoint[]> {
    const rows = await prisma.checkpoint.findMany({
      where: opts.ownerUserId ? { ownerUserId: opts.ownerUserId } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async existsByCabinetId(cabinetId: string): Promise<boolean> {
    const row = await prisma.checkpoint.findUnique({
      where: { cabinetId },
      select: { id: true },
    });
    return row !== null;
  }

  private toDomain(row: {
    id: string;
    name: string;
    description: string | null;
    type: string;
    address: string | null;
    lat: number;
    lng: number;
    cabinetId: string | null;
    ownerUserId: string | null;
    createdAt: Date;
  }): Checkpoint {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      type: row.type,
      address: row.address ?? undefined,
      lat: row.lat,
      lng: row.lng,
      cabinetId: row.cabinetId ?? undefined,
      ownerUserId: row.ownerUserId ?? undefined,
      createdAt: row.createdAt,
    };
  }
}
