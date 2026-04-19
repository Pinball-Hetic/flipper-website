import { describe, it, expect, vi } from "vitest";
import { SetPseudo, InvalidPseudoError, PseudoUnavailableError, PseudoCooldownError, UserNotFoundError } from "./SetPseudo";
import type { IUserRepository } from "../domain/IUserRepository";
import type { IScoreRepository } from "../domain/IScoreRepository";

const makeUserRepo = (overrides: Partial<IUserRepository> = {}): IUserRepository => ({
  findById: vi.fn().mockResolvedValue({ id: "user-1", pseudoUpdatedAt: null }),
  findByPseudo: vi.fn().mockResolvedValue(null),
  setPseudo: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const makeScoreRepo = (existsByPseudo = false): IScoreRepository => ({
  save: vi.fn(),
  saveFromPending: vi.fn(),
  existsRecentScore: vi.fn().mockResolvedValue(false),
  findTopByUser: vi.fn().mockResolvedValue(null),
  existsByPseudo: vi.fn().mockResolvedValue(existsByPseudo),
});

describe("SetPseudo", () => {
  it("throws InvalidPseudoError for invalid format", async () => {
    const uc = new SetPseudo(makeUserRepo(), makeScoreRepo());
    await expect(uc.execute("user-1", "ab")).rejects.toBeInstanceOf(InvalidPseudoError);
    await expect(uc.execute("user-1", "has space")).rejects.toBeInstanceOf(InvalidPseudoError);
    await expect(uc.execute("user-1", "a".repeat(21))).rejects.toBeInstanceOf(InvalidPseudoError);
  });

  it("throws UserNotFoundError when user does not exist", async () => {
    const users = makeUserRepo({ findById: vi.fn().mockResolvedValue(null) });
    const uc = new SetPseudo(users, makeScoreRepo(false));
    await expect(uc.execute("missing", "ValidPseudo")).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it("throws PseudoCooldownError when cooldown not elapsed", async () => {
    const recent = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const users = makeUserRepo({
      findById: vi.fn().mockResolvedValue({ id: "user-1", pseudoUpdatedAt: recent }),
    });
    const uc = new SetPseudo(users, makeScoreRepo(false));
    await expect(uc.execute("user-1", "ValidPseudo")).rejects.toBeInstanceOf(PseudoCooldownError);
  });

  it("succeeds when cooldown has elapsed (>24h)", async () => {
    const old = new Date(Date.now() - 25 * 60 * 60 * 1000);
    const users = makeUserRepo({
      findById: vi.fn().mockResolvedValue({ id: "user-1", pseudoUpdatedAt: old }),
    });
    const scores = makeScoreRepo(false);
    const uc = new SetPseudo(users, scores);
    await expect(uc.execute("user-1", "ValidPseudo")).resolves.toBeUndefined();
    expect(scores.existsByPseudo).toHaveBeenCalledWith("validpseudo");
    expect(users.setPseudo).toHaveBeenCalledWith("user-1", "ValidPseudo", "validpseudo");
  });

  it("throws PseudoUnavailableError when pseudo taken by another User", async () => {
    const users = makeUserRepo({
      findByPseudo: vi.fn().mockResolvedValue({ id: "other-user" }),
    });
    const uc = new SetPseudo(users, makeScoreRepo(false));
    await expect(uc.execute("user-1", "TakenPseudo")).rejects.toBeInstanceOf(PseudoUnavailableError);
  });

  it("throws PseudoUnavailableError when pseudo matches anonymous Score", async () => {
    const users = makeUserRepo({ findByPseudo: vi.fn().mockResolvedValue(null) });
    const scores = makeScoreRepo(true);
    const uc = new SetPseudo(users, scores);
    await expect(uc.execute("user-1", "AnonPseudo")).rejects.toBeInstanceOf(PseudoUnavailableError);
    expect(scores.existsByPseudo).toHaveBeenCalledWith("anonpseudo");
  });

  it("persists pseudoLower in lowercase on success", async () => {
    const users = makeUserRepo();
    const scores = makeScoreRepo(false);
    const uc = new SetPseudo(users, scores);
    await uc.execute("user-1", "MyPseudo_42");
    expect(scores.existsByPseudo).toHaveBeenCalledWith("mypseudo_42");
    expect(users.setPseudo).toHaveBeenCalledWith("user-1", "MyPseudo_42", "mypseudo_42");
  });
});
