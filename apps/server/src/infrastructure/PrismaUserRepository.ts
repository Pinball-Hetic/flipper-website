import type { IUserRepository } from "../domain/IUserRepository";
import { prisma } from "./prisma";

export class PrismaUserRepository implements IUserRepository {
  async setPseudo(userId: string, pseudo: string, pseudoLower: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { pseudo, pseudoLower, pseudoUpdatedAt: new Date() },
    });
  }

  async findByPseudo(pseudoLower: string): Promise<{ id: string } | null> {
    const user = await prisma.user.findFirst({
      where: { pseudoLower },
      select: { id: true },
    });
    return user;
  }

  async findById(
    userId: string,
  ): Promise<{
    id: string;
    pseudo: string | null;
    pseudoUpdatedAt: Date | null;
    role: string;
  } | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, pseudo: true, pseudoUpdatedAt: true, role: true },
    });
    return user;
  }
}
