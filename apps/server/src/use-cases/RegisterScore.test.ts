import { describe, it, expect, vi } from "vitest";
import { RegisterScore, MachineNotFoundError, ValidationError, DuplicateScoreError } from "./RegisterScore";
import type { IScoreRepository } from "../domain/IScoreRepository";
import type { IMachineRepository } from "../domain/IMachineRepository";
import type { Score } from "../domain/Score";

const makeScore = (overrides: Partial<Score> = {}): Score => ({
  id: "score-1",
  value: 1000,
  machineId: "machine-1",
  userId: "user-1",
  createdAt: new Date(),
  ...overrides,
});

const makeScoreRepo = (score?: Score, isDuplicate = false): IScoreRepository => ({
  save: vi.fn().mockResolvedValue(score ?? makeScore()),
  saveFromPending: vi.fn(),
  existsRecentScore: vi.fn().mockResolvedValue(isDuplicate),
  existsByPseudo: vi.fn().mockResolvedValue(false),
  findTopByUser: vi.fn().mockResolvedValue(null),
});

const makeMachineRepo = (exists = true): IMachineRepository => ({
  existsById: vi.fn().mockResolvedValue(exists),
  findAll: vi.fn().mockResolvedValue([]),
  findWithScoresByCheckpoint: vi.fn().mockResolvedValue([]),
  findByCheckpointAndMapId: vi.fn().mockResolvedValue(null),
  create: vi.fn(),
});

const validInput = {
  borneId: "machine-1",
  pseudo: "Player1",
  score: 1000,
};

describe("RegisterScore", () => {
  it("retourne un Score pour une entrée valide", async () => {
    const expected = makeScore();
    const useCase = new RegisterScore(makeScoreRepo(expected), makeMachineRepo());

    const result = await useCase.execute(validInput);

    expect(result).toEqual(expected);
  });

  it("lève MachineNotFoundError si la machine n'existe pas", async () => {
    const useCase = new RegisterScore(makeScoreRepo(), makeMachineRepo(false));

    await expect(useCase.execute(validInput)).rejects.toThrow(MachineNotFoundError);
  });

  it("lève ValidationError si score = 0", async () => {
    const useCase = new RegisterScore(makeScoreRepo(), makeMachineRepo());

    await expect(useCase.execute({ ...validInput, score: 0 })).rejects.toThrow(ValidationError);
  });

  it("lève ValidationError si score > 99_999_999", async () => {
    const useCase = new RegisterScore(makeScoreRepo(), makeMachineRepo());

    await expect(useCase.execute({ ...validInput, score: 100_000_000 })).rejects.toThrow(
      ValidationError,
    );
  });

  it("lève ValidationError si pseudo trop court", async () => {
    const useCase = new RegisterScore(makeScoreRepo(), makeMachineRepo());

    await expect(useCase.execute({ ...validInput, pseudo: "a" })).rejects.toThrow(ValidationError);
  });

  it("lève DuplicateScoreError si un score récent existe pour le même borneId + pseudo", async () => {
    const useCase = new RegisterScore(makeScoreRepo(undefined, true), makeMachineRepo());

    await expect(useCase.execute(validInput)).rejects.toThrow(DuplicateScoreError);
  });

  it("accepte un score identique si existsRecentScore retourne false (> 60s)", async () => {
    const expected = makeScore();
    const useCase = new RegisterScore(makeScoreRepo(expected, false), makeMachineRepo());

    const result = await useCase.execute(validInput);

    expect(result).toEqual(expected);
  });

  it("appelle IScoreRepository.save avec le même pseudo deux fois", async () => {
    const scoreRepo = makeScoreRepo();
    const useCase = new RegisterScore(scoreRepo, makeMachineRepo());

    await useCase.execute(validInput);
    await useCase.execute(validInput);

    expect(scoreRepo.save).toHaveBeenCalledTimes(2);
    expect(scoreRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ pseudo: validInput.pseudo }),
    );
  });
});
