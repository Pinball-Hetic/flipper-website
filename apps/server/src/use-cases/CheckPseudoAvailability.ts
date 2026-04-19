import type { IUserRepository } from "../domain/IUserRepository";
import type { IScoreRepository } from "../domain/IScoreRepository";

export class CheckPseudoAvailability {
  constructor(
    private users: IUserRepository,
    private scores: IScoreRepository,
  ) {}

  async execute(pseudo: string): Promise<{ available: boolean }> {
    const pseudoLower = pseudo.toLowerCase();
    const [existingUser, existingScore] = await Promise.all([
      this.users.findByPseudo(pseudoLower),
      this.scores.existsByPseudo(pseudoLower),
    ]);
    return { available: existingUser === null && !existingScore };
  }
}
