import { describe, it, expect, vi } from "vitest";
import {
  ClaimBorneScore,
  BorneExpiredError,
  BorneNotFoundError,
  BorneAlreadyClaimedError,
  InvalidPseudoError,
  NoPseudoError,
  UserNotFoundError,
} from "./ClaimBorneScore";
import type { IBorneScoreRepository } from "../domain/IBorneScoreRepository";
import type { IUserRepository } from "../domain/IUserRepository";
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
  findByGameId: vi.fn().mockResolvedValue(null),
  existsByCode: vi.fn().mockResolvedValue(false),
  claimByCode: vi.fn().mockResolvedValue(claimable),
  topByMap: vi.fn().mockResolvedValue([]),
});

const makeUserRepo = (
  user: { id: string; pseudo: string | null; pseudoUpdatedAt: Date | null } | null = null,
): IUserRepository => ({
  setPseudo: vi.fn(),
  findByPseudo: vi.fn().mockResolvedValue(null),
  findById: vi.fn().mockResolvedValue(user),
});

describe("ClaimBorneScore — invité", () => {
  it("réclame et retourne le pseudo normalisé en majuscules", async () => {
    const repo = makeRepo(makeBorne());
    const useCase = new ClaimBorneScore(repo, makeUserRepo());
    const result = await useCase.execute("123456", { pseudo: "Lucas_42" });
    expect(result).toBe("LUCAS_42");
    expect(repo.claimByCode).toHaveBeenCalledWith(
      "123456",
      "LUCAS_42",
      expect.any(Date),
      undefined,
    );
  });

  it("lève InvalidPseudoError si pseudo trop court", async () => {
    const useCase = new ClaimBorneScore(makeRepo(makeBorne()), makeUserRepo());
    await expect(useCase.execute("123456", { pseudo: "ab" })).rejects.toThrow(
      InvalidPseudoError,
    );
  });

  it("lève InvalidPseudoError si pseudo grossier", async () => {
    const useCase = new ClaimBorneScore(makeRepo(makeBorne()), makeUserRepo());
    await expect(useCase.execute("123456", { pseudo: "putain_42" })).rejects.toThrow(
      InvalidPseudoError,
    );
  });

  it("lève InvalidPseudoError si pseudo absent", async () => {
    const useCase = new ClaimBorneScore(makeRepo(makeBorne()), makeUserRepo());
    await expect(useCase.execute("123456", {})).rejects.toThrow(InvalidPseudoError);
  });

  it("lève BorneNotFoundError si code inconnu", async () => {
    const useCase = new ClaimBorneScore(makeRepo(null), makeUserRepo());
    await expect(useCase.execute("000000", { pseudo: "Lucas_42" })).rejects.toThrow(
      BorneNotFoundError,
    );
  });

  it("lève BorneExpiredError si expiré", async () => {
    const useCase = new ClaimBorneScore(
      makeRepo(makeBorne({ expiresAt: new Date(Date.now() - 1000) })),
      makeUserRepo(),
    );
    await expect(useCase.execute("123456", { pseudo: "Lucas_42" })).rejects.toThrow(
      BorneExpiredError,
    );
  });

  it("lève BorneAlreadyClaimedError si déjà réclamé", async () => {
    const useCase = new ClaimBorneScore(
      makeRepo(makeBorne({ claimed: true })),
      makeUserRepo(),
    );
    await expect(useCase.execute("123456", { pseudo: "Lucas_42" })).rejects.toThrow(
      BorneAlreadyClaimedError,
    );
  });

  it("lève BorneAlreadyClaimedError si claim atomique perd la course", async () => {
    const useCase = new ClaimBorneScore(makeRepo(makeBorne(), false), makeUserRepo());
    await expect(useCase.execute("123456", { pseudo: "Lucas_42" })).rejects.toThrow(
      BorneAlreadyClaimedError,
    );
  });
});

describe("ClaimBorneScore — compte connecté", () => {
  it("réclame avec le pseudo du compte et lie claimedByUserId", async () => {
    const repo = makeRepo(makeBorne());
    const userRepo = makeUserRepo({
      id: "user-1",
      pseudo: "BallWizard",
      pseudoUpdatedAt: new Date(),
    });
    const useCase = new ClaimBorneScore(repo, userRepo);
    const result = await useCase.execute("123456", { userId: "user-1" });
    expect(result).toBe("BallWizard");
    expect(repo.claimByCode).toHaveBeenCalledWith(
      "123456",
      "BallWizard",
      expect.any(Date),
      "user-1",
    );
  });

  it("lève NoPseudoError si le compte n'a pas de pseudo", async () => {
    const userRepo = makeUserRepo({
      id: "user-1",
      pseudo: null,
      pseudoUpdatedAt: null,
    });
    const useCase = new ClaimBorneScore(makeRepo(makeBorne()), userRepo);
    await expect(useCase.execute("123456", { userId: "user-1" })).rejects.toThrow(
      NoPseudoError,
    );
  });

  it("lève UserNotFoundError si le compte est introuvable", async () => {
    const useCase = new ClaimBorneScore(makeRepo(makeBorne()), makeUserRepo(null));
    await expect(useCase.execute("123456", { userId: "ghost" })).rejects.toThrow(
      UserNotFoundError,
    );
  });

  it("ignore le pseudo fourni quand userId est présent", async () => {
    const repo = makeRepo(makeBorne());
    const userRepo = makeUserRepo({
      id: "user-1",
      pseudo: "BallWizard",
      pseudoUpdatedAt: new Date(),
    });
    const useCase = new ClaimBorneScore(repo, userRepo);
    const result = await useCase.execute("123456", {
      userId: "user-1",
      pseudo: "spoofed",
    });
    expect(result).toBe("BallWizard");
  });
});
