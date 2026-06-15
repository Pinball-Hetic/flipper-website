import type { IUserRepository } from "../domain/IUserRepository";
import type { IScoreRepository } from "../domain/IScoreRepository";
import { validatePseudo, InvalidPseudoError } from "../domain/Pseudo";
import { CheckPseudoAvailability } from "./CheckPseudoAvailability";

export { InvalidPseudoError };

export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User not found: ${id}`);
    this.name = "UserNotFoundError";
  }
}

export class PseudoUnavailableError extends Error {
  constructor() {
    super("Ce pseudo est déjà pris");
    this.name = "PseudoUnavailableError";
  }
}

export class PseudoCooldownError extends Error {
  constructor() {
    super("Vous devez attendre 24h avant de changer votre pseudo");
    this.name = "PseudoCooldownError";
  }
}

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export class SetPseudo {
  constructor(
    private users: IUserRepository,
    private scores: IScoreRepository,
  ) {}

  async execute(userId: string, pseudo: string): Promise<void> {
    validatePseudo(pseudo);

    const pseudoLower = pseudo.toLowerCase();

    const user = await this.users.findById(userId);
    if (!user) throw new UserNotFoundError(userId);

    if (user.pseudoUpdatedAt) {
      const elapsed = Date.now() - user.pseudoUpdatedAt.getTime();
      if (elapsed < COOLDOWN_MS) throw new PseudoCooldownError();
    }

    const checker = new CheckPseudoAvailability(this.users, this.scores);
    const { available } = await checker.execute(pseudo);
    if (!available) throw new PseudoUnavailableError();

    await this.users.setPseudo(userId, pseudo, pseudoLower);
  }
}
