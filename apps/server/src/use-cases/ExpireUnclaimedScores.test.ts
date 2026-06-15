import { describe, it, expect, vi } from "vitest";
import { ExpireUnclaimedScores } from "./ExpireUnclaimedScores";
import type { IPendingScoreRepository } from "../domain/IPendingScoreRepository";
import type { IScoreRepository } from "../domain/IScoreRepository";
import type { IAnonymousNameGenerator } from "../domain/IAnonymousNameGenerator";
import type { PendingScore } from "../domain/PendingScore";
import type { Score } from "../domain/Score";

const makeExpiredPending = (id: string): PendingScore => ({
  id,
  gameId: `game-${id}`,
  claimCode: `CODE${id.slice(-2).toUpperCase()}`,
  borneId: "machine-1",
  score: 3000,
  timestamp: new Date("2026-04-16T10:00:00.000Z"),
  expiresAt: new Date(Date.now() - 1000),
  status: "UNCLAIMED",
});

const makeScore = (id: string): Score => ({
  id,
  value: 3000,
  machineId: "machine-1",
  userId: "anon-user",
  createdAt: new Date(),
});

const makeScoreRepo = (): IScoreRepository => ({
  save: vi.fn().mockImplementation((_data) => Promise.resolve(makeScore("score-" + Math.random()))),
  saveFromPending: vi.fn(),
  existsRecentScore: vi.fn().mockResolvedValue(false),
  existsByPseudo: vi.fn().mockResolvedValue(false),
  findTopByUser: vi.fn().mockResolvedValue(null),
});

const makeNameGenerator = (): IAnonymousNameGenerator => ({
  generate: vi.fn().mockReturnValue("Cosmic_Bat"),
});

describe("ExpireUnclaimedScores", () => {
  it("retourne 3 quand 3 pending expirés sont traités", async () => {
    const pendingRepo: IPendingScoreRepository = {
      save: vi.fn(),
      findByCode: vi.fn(),
      findByGameId: vi.fn(),
      findExpired: vi.fn().mockResolvedValue([
        makeExpiredPending("1"),
        makeExpiredPending("2"),
        makeExpiredPending("3"),
      ]),
      claimIfUnclaimed: vi.fn().mockResolvedValue(true),
      markClaimed: vi.fn(),
      markExpired: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new ExpireUnclaimedScores(pendingRepo, makeScoreRepo(), makeNameGenerator());
    const count = await useCase.execute();

    expect(count).toBe(3);
    expect(pendingRepo.markExpired).toHaveBeenCalledTimes(3);
  });

  it("est idempotent — second appel retourne 0", async () => {
    let callCount = 0;
    const pendingRepo: IPendingScoreRepository = {
      save: vi.fn(),
      findByCode: vi.fn(),
      findByGameId: vi.fn(),
      findExpired: vi.fn().mockImplementation(() => {
        if (callCount === 0) {
          callCount++;
          return Promise.resolve([makeExpiredPending("1")]);
        }
        return Promise.resolve([]);
      }),
      claimIfUnclaimed: vi.fn().mockResolvedValue(true),
      markClaimed: vi.fn(),
      markExpired: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new ExpireUnclaimedScores(pendingRepo, makeScoreRepo(), makeNameGenerator());
    await useCase.execute();
    const secondCount = await useCase.execute();

    expect(secondCount).toBe(0);
  });

  it("retourne 0 et ne crée rien si aucun expiré", async () => {
    const scoreRepo = makeScoreRepo();
    const pendingRepo: IPendingScoreRepository = {
      save: vi.fn(),
      findByCode: vi.fn(),
      findByGameId: vi.fn(),
      findExpired: vi.fn().mockResolvedValue([]),
      claimIfUnclaimed: vi.fn().mockResolvedValue(true),
      markClaimed: vi.fn(),
      markExpired: vi.fn(),
    };

    const useCase = new ExpireUnclaimedScores(pendingRepo, scoreRepo, makeNameGenerator());
    const count = await useCase.execute();

    expect(count).toBe(0);
    expect(scoreRepo.save).not.toHaveBeenCalled();
    expect(pendingRepo.markExpired).not.toHaveBeenCalled();
  });
});
