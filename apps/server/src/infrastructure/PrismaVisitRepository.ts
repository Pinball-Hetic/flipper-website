import type { IVisitRepository } from "../domain/IVisitRepository";
import { prisma } from "./prisma";

export class PrismaVisitRepository implements IVisitRepository {
  async countByUser(userId: string): Promise<number> {
    return prisma.visit.count({ where: { userId } });
  }
}
