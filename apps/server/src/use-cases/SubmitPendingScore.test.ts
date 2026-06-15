import { describe, it, expect, vi } from "vitest";
import { SubmitPendingScore, DuplicateGameError } from "./SubmitPendingScore";
import { ValidationError, MachineNotFoundError } from "./RegisterScore";
import type { IPendingScoreRepository } from "../domain/IPendingScoreRepository";
import type { IMachineRepository } from "../domain/IMachineRepository";
import type { PendingScore } from "../domain/PendingScore";

const now = new Date("2026-04-17T10:00:00.000Z");

const makePending = (overrides: Partial<PendingScore> = {}): PendingScore => ({
  id: "pending-1",
  gameId: "550e8400-e29b-41d4-a716-446655440000",
  claimCode: "ABC123",
  borneId: "machine-1",
  score: 5000,
  timestamp: now,
  expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
  status: "UNCLAIMED",
  ...overrides,
});

const makePendingRepo = (existing: PendingScore | null = null): IPendingScoreRepository => ({
  save: vi.fn().mockResolvedValue(makePending()),
  findByCode: vi.fn().mockResolvedValue(null),
  findByGameId: vi.fn().mockResolvedValue(existing),
  findExpired: vi.fn().mockResolvedValue([]),
  claimIfUnclaimed: vi.fn().mockResolvedValue(true),
  markClaimed: vi.fn().mockResolvedValue(undefined),
  markExpired: vi.fn().mockResolvedValue(undefined),
});

const makeMachineRepo = (exists = true): IMachineRepository => ({
  existsById: vi.fn().mockResolvedValue(exists),
  findAll: vi.fn().mockResolvedValue([]),
  findWithScoresByCheckpoint: vi.fn().mockResolvedValue([]),
});

const validInput = {
  gameId: "550e8400-e29b-41d4-a716-446655440000",
  borneId: "machine-1",
  score: 5000,
  timestamp: "2026-04-17T10:00:00.000Z",
};

describe("SubmitPendingScore", () => {
  it("retourne un PendingScore pour un payload valide", async () => {
    const useCase = new SubmitPendingScore(makePendingRepo(), makeMachineRepo());
    const result = await useCase.execute(validInput);
    expect(result).toBeDefined();
    expect(result.status).toBe("UNCLAIMED");
  });

  it("lève MachineNotFoundError si la machine n'existe pas", async () => {
    const useCase = new SubmitPendingScore(makePendingRepo(), makeMachineRepo(false));
    await expect(useCase.execute(validInput)).rejects.toThrow(MachineNotFoundError);
  });

  it("lève DuplicateGameError si le gameId existe déjà", async () => {
    const useCase = new SubmitPendingScore(makePendingRepo(makePending()), makeMachineRepo());
    await expect(useCase.execute(validInput)).rejects.toThrow(DuplicateGameError);
  });

  it("lève ValidationError si score = 0", async () => {
    const useCase = new SubmitPendingScore(makePendingRepo(), makeMachineRepo());
    await expect(useCase.execute({ ...validInput, score: 0 })).rejects.toThrow(ValidationError);
  });

  it("lève ValidationError si gameId n'est pas un UUID", async () => {
    const useCase = new SubmitPendingScore(makePendingRepo(), makeMachineRepo());
    await expect(useCase.execute({ ...validInput, gameId: "not-a-uuid" })).rejects.toThrow(
      ValidationError,
    );
  });
});
