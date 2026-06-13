import { z } from "zod";
import type { IBorneScoreRepository } from "../domain/IBorneScoreRepository";
import { validatePseudo, isProfane, InvalidPseudoError } from "../domain/Pseudo";
import { BorneNotFoundError, BorneAlreadyClaimedError } from "./GetBorneClaim";

export { InvalidPseudoError, BorneNotFoundError, BorneAlreadyClaimedError };

export class BorneExpiredError extends Error {
  constructor() {
    super("Ce code de partie a expiré");
    this.name = "BorneExpiredError";
  }
}

const ClaimBorneScoreSchema = z.object({
  pseudo: z.string(),
});

export type ClaimBorneScoreInput = z.input<typeof ClaimBorneScoreSchema>;

export class ClaimBorneScore {
  constructor(private borneScores: IBorneScoreRepository) {}

  async execute(code: string, input: ClaimBorneScoreInput): Promise<string> {
    const parsed = ClaimBorneScoreSchema.safeParse(input);
    if (!parsed.success) throw new InvalidPseudoError("Pseudo requis");

    const pseudo = parsed.data.pseudo;
    validatePseudo(pseudo);
    if (isProfane(pseudo)) throw new InvalidPseudoError("Pseudo non autorisé");

    const normalized = pseudo.toUpperCase();

    const borne = await this.borneScores.findByCode(code);
    if (!borne) throw new BorneNotFoundError();

    if (borne.expiresAt < new Date()) throw new BorneExpiredError();
    if (borne.claimed) throw new BorneAlreadyClaimedError();

    const claimed = await this.borneScores.claimByCode(code, normalized, new Date());
    if (!claimed) throw new BorneAlreadyClaimedError();

    return normalized;
  }
}
