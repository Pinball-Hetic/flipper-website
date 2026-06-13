import { describe, it, expect, vi } from "vitest";
import {
  ClaimBorneScore,
  BorneExpiredError,
  BorneNotFoundError,
  BorneAlreadyClaimedError,
  InvalidPseudoError,
} from "./ClaimBorneScore";
import type { IBorneScoreRepository } from "../domain/IBorneScoreRepository";
import type { BorneScore } from "../domain/BorneScore";

const makeBorne = (overrides: Partial<BorneScore> = {}): BorneScore => ({
  id: "borne-1",
  code: "123456",
  cabinetId: "borne-paris-01",
  mapId: "strangerthings",
  score: 42000,
  playedAt: new Date("2026-06-14T09:00:00.000Z"),
  claimed: false,
  expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  createdAt: new Date("2026-06-14T09:00:00.000Z"),
  ...overrides,
});

const makeRepo = (
  borne: BorneScore | null,
  claimable = true,
): IBorneScoreRepository => ({
  save: vi.fn(),
  findByCode: vi.fn().mockResolvedValue(borne),
  existsByCode: vi.fn().mockResolvedValue(false),
  claimByCode: vi.fn().mockResolvedValue(claimable),
  topByMap: vi.fn().mockResolvedValue([]),
});

describe("ClaimBorneScore", () => {
  it("réclame et retourne le pseudo normalisé en majuscules", async () => {
    const repo = makeRepo(makeBorne());
    const useCase = new ClaimBorneScore(repo);
    const result = await useCase.execute("123456", { pseudo: "Lucas_42" });
    expect(result).toBe("LUCAS_42");
    expect(repo.claimByCode).toHaveBeenCalledWith("123456", "LUCAS_42", expect.any(Date));
  });

  it("lève InvalidPseudoError si pseudo trop court", async () => {
    const useCase = new ClaimBorneScore(makeRepo(makeBorne()));
    await expect(useCase.execute("123456", { pseudo: "ab" })).rejects.toThrow(
      InvalidPseudoError,
    );
  });

  it("lève InvalidPseudoError si pseudo grossier", async () => {
    const useCase = new ClaimBorneScore(makeRepo(makeBorne()));
    await expect(useCase.execute("123456", { pseudo: "putain_42" })).rejects.toThrow(
      InvalidPseudoError,
    );
  });

  it("lève InvalidPseudoError si pseudo absent", async () => {
    const useCase = new ClaimBorneScore(makeRepo(makeBorne()));
    await expect(
      useCase.execute("123456", { pseudo: undefined as unknown as string }),
    ).rejects.toThrow(InvalidPseudoError);
  });

  it("lève BorneNotFoundError si code inconnu", async () => {
    const useCase = new ClaimBorneScore(makeRepo(null));
    await expect(useCase.execute("000000", { pseudo: "Lucas_42" })).rejects.toThrow(
      BorneNotFoundError,
    );
  });

  it("lève BorneExpiredError si expiré", async () => {
    const useCase = new ClaimBorneScore(
      makeRepo(makeBorne({ expiresAt: new Date(Date.now() - 1000) })),
    );
    await expect(useCase.execute("123456", { pseudo: "Lucas_42" })).rejects.toThrow(
      BorneExpiredError,
    );
  });

  it("lève BorneAlreadyClaimedError si déjà réclamé", async () => {
    const useCase = new ClaimBorneScore(makeRepo(makeBorne({ claimed: true })));
    await expect(useCase.execute("123456", { pseudo: "Lucas_42" })).rejects.toThrow(
      BorneAlreadyClaimedError,
    );
  });

  it("lève BorneAlreadyClaimedError si claim atomique perd la course", async () => {
    const useCase = new ClaimBorneScore(makeRepo(makeBorne(), false));
    await expect(useCase.execute("123456", { pseudo: "Lucas_42" })).rejects.toThrow(
      BorneAlreadyClaimedError,
    );
  });
});
