import { describe, it, expect, vi } from "vitest";
import { GetWorldLeaderboard } from "./GetWorldLeaderboard";
import { ValidationError } from "./RegisterScore";
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
  expiresAt: new Date("2026-06-15T09:00:00.000Z"),
  createdAt: new Date("2026-06-14T09:00:00.000Z"),
  ...overrides,
});

const makeRepo = (rows: BorneScore[]): IBorneScoreRepository => ({
  save: vi.fn(),
  findByCode: vi.fn().mockResolvedValue(null),
  findByGameId: vi.fn().mockResolvedValue(null),
  existsByCode: vi.fn().mockResolvedValue(false),
  claimByCode: vi.fn().mockResolvedValue(true),
  topByMap: vi.fn().mockResolvedValue(rows),
});

describe("GetWorldLeaderboard", () => {
  it("retourne les entrées classées avec rank", async () => {
    const repo = makeRepo([
      makeBorne({ id: "a", score: 9000, claimed: true, pseudo: "ACE" }),
      makeBorne({ id: "b", score: 5000, claimed: false, pseudo: undefined }),
    ]);
    const useCase = new GetWorldLeaderboard(repo);
    const entries = await useCase.execute({ mapId: "strangerthings" });
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ rank: 1, pseudo: "ACE", score: 9000, claimed: true });
    expect(entries[1]).toMatchObject({ rank: 2, pseudo: null, score: 5000, claimed: false });
  });

  it("met pseudo à null si non réclamé même si une valeur traîne", async () => {
    const repo = makeRepo([makeBorne({ claimed: false, pseudo: "GHOST" })]);
    const useCase = new GetWorldLeaderboard(repo);
    const entries = await useCase.execute({ mapId: "strangerthings" });
    expect(entries[0].pseudo).toBeNull();
  });

  it("utilise limit par défaut 10", async () => {
    const repo = makeRepo([]);
    const useCase = new GetWorldLeaderboard(repo);
    await useCase.execute({ mapId: "strangerthings" });
    expect(repo.topByMap).toHaveBeenCalledWith("strangerthings", 10);
  });

  it("coerce et clamp limit (string -> number)", async () => {
    const repo = makeRepo([]);
    const useCase = new GetWorldLeaderboard(repo);
    await useCase.execute({ mapId: "strangerthings", limit: "25" });
    expect(repo.topByMap).toHaveBeenCalledWith("strangerthings", 25);
  });

  it("lève ValidationError si limit > 100", async () => {
    const useCase = new GetWorldLeaderboard(makeRepo([]));
    await expect(
      useCase.execute({ mapId: "strangerthings", limit: 500 }),
    ).rejects.toThrow(ValidationError);
  });

  it("lève ValidationError si scope non supporté", async () => {
    const useCase = new GetWorldLeaderboard(makeRepo([]));
    await expect(
      useCase.execute({ mapId: "strangerthings", scope: "country" as "world" }),
    ).rejects.toThrow(ValidationError);
  });

  it("lève ValidationError si mapId vide", async () => {
    const useCase = new GetWorldLeaderboard(makeRepo([]));
    await expect(useCase.execute({ mapId: "" })).rejects.toThrow(ValidationError);
  });
});
