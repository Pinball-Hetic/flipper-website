import { describe, it, expect, vi } from "vitest";
import { GetBorneClaim, BorneNotFoundError, BorneAlreadyClaimedError } from "./GetBorneClaim";
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

const makeRepo = (borne: BorneScore | null): IBorneScoreRepository => ({
  save: vi.fn(),
  findByCode: vi.fn().mockResolvedValue(borne),
  findByGameId: vi.fn().mockResolvedValue(null),
  existsByCode: vi.fn().mockResolvedValue(false),
  claimByCode: vi.fn().mockResolvedValue(true),
  topByMap: vi.fn().mockResolvedValue([]),
});

describe("GetBorneClaim", () => {
  it("retourne le score si code valide non réclamé", async () => {
    const useCase = new GetBorneClaim(makeRepo(makeBorne()));
    const result = await useCase.execute("123456");
    expect(result.mapId).toBe("strangerthings");
  });

  it("lève BorneNotFoundError si code inconnu", async () => {
    const useCase = new GetBorneClaim(makeRepo(null));
    await expect(useCase.execute("000000")).rejects.toThrow(BorneNotFoundError);
  });

  it("lève BorneAlreadyClaimedError si déjà réclamé", async () => {
    const useCase = new GetBorneClaim(makeRepo(makeBorne({ claimed: true })));
    await expect(useCase.execute("123456")).rejects.toThrow(BorneAlreadyClaimedError);
  });

  it("lève BorneNotFoundError si expiré et non réclamé", async () => {
    const useCase = new GetBorneClaim(
      makeRepo(makeBorne({ expiresAt: new Date(Date.now() - 1000) })),
    );
    await expect(useCase.execute("123456")).rejects.toThrow(BorneNotFoundError);
  });
});
