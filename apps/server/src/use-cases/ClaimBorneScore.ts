import { z } from "zod";
import type { BorneScore } from "../domain/BorneScore";
import type { IBorneScoreRepository } from "../domain/IBorneScoreRepository";
import type { IUserRepository } from "../domain/IUserRepository";
import { validatePseudo, isProfane, InvalidPseudoError } from "../domain/Pseudo";
import { BorneNotFoundError, BorneAlreadyClaimedError } from "./GetBorneClaim";

export { InvalidPseudoError, BorneNotFoundError, BorneAlreadyClaimedError };

export class BorneExpiredError extends Error {
  constructor() {
    super("Ce code de partie a expiré");
    this.name = "BorneExpiredError";
  }
}

export class NoPseudoError extends Error {
  constructor() {
    super("Ce compte n'a pas encore de pseudo");
    this.name = "NoPseudoError";
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super("Compte introuvable");
    this.name = "UserNotFoundError";
  }
}

const ClaimBorneScoreSchema = z.object({
  pseudo: z.string().optional(),
  userId: z.string().optional(),
});

export type ClaimBorneScoreInput = z.input<typeof ClaimBorneScoreSchema>;

export class ClaimBorneScore {
  constructor(
    private borneScores: IBorneScoreRepository,
    private users: IUserRepository,
  ) {}

  async execute(
    code: string,
    input: ClaimBorneScoreInput,
  ): Promise<{ pseudo: string; borne: BorneScore }> {
    const parsed = ClaimBorneScoreSchema.safeParse(input);
    if (!parsed.success) throw new InvalidPseudoError("Requête invalide");

    const { pseudo: rawPseudo, userId } = parsed.data;

    const { pseudo, claimUserId } = userId
      ? await this.resolveAccount(userId)
      : { pseudo: this.resolveGuest(rawPseudo), claimUserId: undefined };

    const borne = await this.borneScores.findByCode(code);
    if (!borne) throw new BorneNotFoundError();

    if (borne.expiresAt < new Date()) throw new BorneExpiredError();
    if (borne.claimed) throw new BorneAlreadyClaimedError();

    const claimed = await this.borneScores.claimByCode(
      code,
      pseudo,
      new Date(),
      claimUserId,
    );
    if (!claimed) throw new BorneAlreadyClaimedError();

    return { pseudo, borne };
  }

  private async resolveAccount(
    userId: string,
  ): Promise<{ pseudo: string; claimUserId: string }> {
    const user = await this.users.findById(userId);
    if (!user) throw new UserNotFoundError();
    if (!user.pseudo) throw new NoPseudoError();
    return { pseudo: user.pseudo, claimUserId: user.id };
  }

  private resolveGuest(rawPseudo?: string): string {
    if (!rawPseudo) throw new InvalidPseudoError("Pseudo requis");
    validatePseudo(rawPseudo);
    if (isProfane(rawPseudo)) throw new InvalidPseudoError("Pseudo non autorisé");
    return rawPseudo.toUpperCase();
  }
}
