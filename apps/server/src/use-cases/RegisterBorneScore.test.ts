import { describe, it, expect, vi } from "vitest";
import { RegisterBorneScore, CodeGenerationError } from "./RegisterBorneScore";
import { ValidationError } from "./RegisterScore";
import type { IBorneScoreRepository } from "../domain/IBorneScoreRepository";
import type { BorneScore } from "../domain/BorneScore";

const playedAt = new Date("2026-06-14T10:00:00.000Z");
const GAME_ID = "550e8400-e29b-41d4-a716-446655440000";

const makeBorne = (overrides: Partial<BorneScore> = {}): BorneScore => ({
  id: "borne-1",
  code: "123456",
  cabinetId: "borne-paris-01",
  mapId: "strangerthings",
  score: 42000,
  playedAt,
  claimed: false,
  expiresAt: new Date(playedAt.getTime() + 24 * 60 * 60 * 1000),
  createdAt: playedAt,
  ...overrides,
});

const makeRepo = (existsByCode = false): IBorneScoreRepository => ({
  save: vi.fn().mockResolvedValue(makeBorne()),
  findByCode: vi.fn().mockResolvedValue(null),
  findByGameId: vi.fn().mockResolvedValue(null),
  existsByCode: vi.fn().mockResolvedValue(existsByCode),
  claimByCode: vi.fn().mockResolvedValue(true),
  topByMap: vi.fn().mockResolvedValue([]),
});

const validInput = {
  cabinetId: "borne-paris-01",
  mapId: "strangerthings",
  score: 42000,
  playedAt: "2026-06-14T10:00:00.000Z",
};

describe("RegisterBorneScore", () => {
  it("crée un BorneScore pour un payload valide sans gameId", async () => {
    const useCase = new RegisterBorneScore(makeRepo());
    const result = await useCase.execute(validInput);
    expect(result.created).toBe(true);
    expect(result.borne.id).toBe("borne-1");
    expect(result.borne.code).toMatch(/^\d{6}$/);
  });

  it("calcule expiresAt = playedAt + 24h", async () => {
    const repo = makeRepo();
    const useCase = new RegisterBorneScore(repo);
    await useCase.execute(validInput);
    const arg = (repo.save as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(arg.expiresAt.getTime() - arg.playedAt.getTime()).toBe(24 * 60 * 60 * 1000);
  });

  it("accepte les champs optionnels (maxCombo, counters, durationS)", async () => {
    const repo = makeRepo();
    const useCase = new RegisterBorneScore(repo);
    await useCase.execute({
      ...validInput,
      maxCombo: 12,
      maxMultiplier: 5,
      counters: { ramps: 3, bumpers: 40 },
      durationS: 120,
    });
    const arg = (repo.save as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(arg.counters).toEqual({ ramps: 3, bumpers: 40 });
  });

  it("réessaie sur collision de code puis sauvegarde", async () => {
    const repo = makeRepo();
    repo.existsByCode = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValue(false);
    const useCase = new RegisterBorneScore(repo);
    await useCase.execute(validInput);
    expect(repo.existsByCode).toHaveBeenCalledTimes(3);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it("lève CodeGenerationError après 10 collisions", async () => {
    const useCase = new RegisterBorneScore(makeRepo(true));
    await expect(useCase.execute(validInput)).rejects.toThrow(CodeGenerationError);
  });

  it("lève ValidationError si score = 0", async () => {
    const useCase = new RegisterBorneScore(makeRepo());
    await expect(useCase.execute({ ...validInput, score: 0 })).rejects.toThrow(ValidationError);
  });

  it("lève ValidationError si playedAt sans offset", async () => {
    const useCase = new RegisterBorneScore(makeRepo());
    await expect(
      useCase.execute({ ...validInput, playedAt: "2026-06-14T10:00:00" }),
    ).rejects.toThrow(ValidationError);
  });

  it("lève ValidationError si cabinetId vide", async () => {
    const useCase = new RegisterBorneScore(makeRepo());
    await expect(useCase.execute({ ...validInput, cabinetId: "" })).rejects.toThrow(
      ValidationError,
    );
  });

  it("lève ValidationError si gameId n'est pas un UUID", async () => {
    const useCase = new RegisterBorneScore(makeRepo());
    await expect(useCase.execute({ ...validInput, gameId: "not-a-uuid" })).rejects.toThrow(
      ValidationError,
    );
  });

  describe("idempotence (gameId)", () => {
    it("crée quand gameId est nouveau (inconnu)", async () => {
      const repo = makeRepo();
      const useCase = new RegisterBorneScore(repo);
      const result = await useCase.execute({ ...validInput, gameId: GAME_ID });
      expect(result.created).toBe(true);
      expect(repo.findByGameId).toHaveBeenCalledWith(GAME_ID);
      const arg = (repo.save as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(arg.gameId).toBe(GAME_ID);
    });

    it("renvoie l'existant sans doublon ni nouveau code si gameId déjà connu", async () => {
      const repo = makeRepo();
      const existing = makeBorne({ id: "borne-existing", code: "999999", gameId: GAME_ID });
      repo.findByGameId = vi.fn().mockResolvedValue(existing);
      const useCase = new RegisterBorneScore(repo);
      const result = await useCase.execute({ ...validInput, gameId: GAME_ID });
      expect(result.created).toBe(false);
      expect(result.borne).toBe(existing);
      expect(result.borne.code).toBe("999999");
      expect(repo.save).not.toHaveBeenCalled();
      expect(repo.existsByCode).not.toHaveBeenCalled();
    });

    it("gère la race condition : save échoue en P2002 → refetch renvoie l'existant", async () => {
      const repo = makeRepo();
      const existing = makeBorne({ id: "borne-existing", code: "999999", gameId: GAME_ID });
      repo.findByGameId = vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValue(existing);
      repo.save = vi.fn().mockRejectedValue(Object.assign(new Error("Unique"), { code: "P2002" }));
      const useCase = new RegisterBorneScore(repo);
      const result = await useCase.execute({ ...validInput, gameId: GAME_ID });
      expect(result.created).toBe(false);
      expect(result.borne).toBe(existing);
      expect(repo.findByGameId).toHaveBeenCalledTimes(2);
    });

    it("propage l'erreur si save échoue sans gameId", async () => {
      const repo = makeRepo();
      repo.save = vi.fn().mockRejectedValue(new Error("DB down"));
      const useCase = new RegisterBorneScore(repo);
      await expect(useCase.execute(validInput)).rejects.toThrow("DB down");
    });
  });
});
