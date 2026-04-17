import { describe, it, expect, vi } from "vitest";
import { ClaimScore, NotFoundError, AlreadyClaimedError, ExpiredCodeError } from "./ClaimScore";
import { ValidationError } from "./RegisterScore";
import type { IPendingScoreRepository } from "../domain/IPendingScoreRepository";
import type { IScoreRepository } from "../domain/IScoreRepository";
import type { PendingScore } from "../domain/PendingScore";
import type { Score } from "../domain/Score";

const makeScore = (): Score => ({
  id: "score-1",
  value: 5000,
  machineId: "machine-1",
  userId: "user-1",
  createdAt: new Date(),
});

const makePending = (overrides: Partial<PendingScore> = {}): PendingScore => ({
  id: "pending-1",
  gameId: "550e8400-e29b-41d4-a716-446655440000",
  claimCode: "ABC123",
  borneId: "machine-1",
  score: 5000,
  timestamp: new Date("2026-04-17T09:00:00.000Z"),
  expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  status: "UNCLAIMED",
  ...overrides,
});

const makePendingRepo = (
  pending: PendingScore | null,
  claimable = true,
): IPendingScoreRepository => ({
  save: vi.fn(),
  findByCode: vi.fn().mockResolvedValue(pending),
  findByGameId: vi.fn().mockResolvedValue(null),
  findExpired: vi.fn().mockResolvedValue([]),
  claimIfUnclaimed: vi.fn().mockResolvedValue(claimable),
  markClaimed: vi.fn().mockResolvedValue(undefined),
  markExpired: vi.fn().mockResolvedValue(undefined),
});

const makeScoreRepo = (): IScoreRepository => ({
  save: vi.fn(),
  saveFromPending: vi.fn().mockResolvedValue(makeScore()),
  existsRecentScore: vi.fn().mockResolvedValue(false),
});

const validInput = { claimCode: "ABC123", userId: "user-1" };

describe("ClaimScore", () => {
  it("retourne un Score quand code valide et user connecté", async () => {
    const useCase = new ClaimScore(makePendingRepo(makePending()), makeScoreRepo());
    const result = await useCase.execute(validInput);
    expect(result.id).toBe("score-1");
  });

  it("lève NotFoundError si code inexistant", async () => {
    const useCase = new ClaimScore(makePendingRepo(null), makeScoreRepo());
    await expect(useCase.execute(validInput)).rejects.toThrow(NotFoundError);
  });

  it("lève AlreadyClaimedError si le score est déjà réclamé (race condition)", async () => {
    const useCase = new ClaimScore(
      makePendingRepo(makePending(), false),
      makeScoreRepo(),
    );
    await expect(useCase.execute(validInput)).rejects.toThrow(AlreadyClaimedError);
  });

  it("lève ExpiredCodeError si expiresAt dans le passé", async () => {
    const useCase = new ClaimScore(
      makePendingRepo(makePending({ expiresAt: new Date(Date.now() - 1000) })),
      makeScoreRepo(),
    );
    await expect(useCase.execute(validInput)).rejects.toThrow(ExpiredCodeError);
  });

  it("lève ValidationError si claimCode invalide", async () => {
    const useCase = new ClaimScore(makePendingRepo(makePending()), makeScoreRepo());
    await expect(useCase.execute({ ...validInput, claimCode: "abc" })).rejects.toThrow(
      ValidationError,
    );
  });
});
