import { describe, it, expect, vi } from "vitest";
import { RecordAccountScore } from "./RecordAccountScore";
import type { Checkpoint } from "../domain/Checkpoint";
import type { Machine } from "../domain/IMachineRepository";
import type { ICheckpointRepository } from "../domain/ICheckpointRepository";
import type { IMachineRepository } from "../domain/IMachineRepository";
import type { IScoreRepository } from "../domain/IScoreRepository";

const makeCheckpoint = (overrides: Partial<Checkpoint> = {}): Checkpoint => ({
  id: "cp-1",
  name: "Le Perchoir",
  type: "OTHER",
  lat: 48.86,
  lng: 2.38,
  cabinetId: "brn_abcd1234",
  createdAt: new Date(),
  ...overrides,
});

const makeMachine = (overrides: Partial<Machine> = {}): Machine => ({
  id: "machine-1",
  name: "strangerthings",
  mapId: "strangerthings",
  checkpointId: "cp-1",
  checkpointName: "Le Perchoir",
  createdAt: new Date(),
  ...overrides,
});

const makeCheckpoints = (
  checkpoint: Checkpoint | null,
): ICheckpointRepository => ({
  create: vi.fn(),
  update: vi.fn(),
  findById: vi.fn(),
  findByCabinetId: vi.fn().mockResolvedValue(checkpoint),
  findByTokenHash: vi.fn(),
  list: vi.fn(),
  existsByCabinetId: vi.fn(),
  setToken: vi.fn(),
  setOwner: vi.fn(),
});

const makeMachines = (
  overrides: Partial<IMachineRepository> = {},
): IMachineRepository => ({
  existsById: vi.fn(),
  findAll: vi.fn(),
  findWithScoresByCheckpoint: vi.fn(),
  findByCheckpointAndMapId: vi.fn().mockResolvedValue(makeMachine()),
  create: vi.fn().mockResolvedValue(makeMachine()),
  ...overrides,
});

const makeScores = (
  overrides: Partial<IScoreRepository> = {},
): IScoreRepository => ({
  save: vi.fn(),
  saveFromPending: vi.fn().mockResolvedValue({
    id: "score-1",
    value: 42000,
    machineId: "machine-1",
    userId: "user-1",
    createdAt: new Date(),
  }),
  existsRecentScore: vi.fn(),
  findTopByUser: vi.fn(),
  existsByPseudo: vi.fn(),
  ...overrides,
});

const input = {
  cabinetId: "brn_abcd1234",
  mapId: "strangerthings",
  value: 42000,
  userId: "user-1",
  playedAt: new Date("2026-06-19T10:00:00.000Z"),
};

describe("RecordAccountScore", () => {
  it("skip (null) si la borne n'est pas un Checkpoint enregistré", async () => {
    const machines = makeMachines();
    const scores = makeScores();
    const useCase = new RecordAccountScore(makeCheckpoints(null), machines, scores);

    const result = await useCase.execute(input);

    expect(result).toBeNull();
    expect(machines.findByCheckpointAndMapId).not.toHaveBeenCalled();
    expect(scores.saveFromPending).not.toHaveBeenCalled();
  });

  it("réutilise la Machine existante pour ce mapId", async () => {
    const machines = makeMachines();
    const scores = makeScores();
    const useCase = new RecordAccountScore(
      makeCheckpoints(makeCheckpoint()),
      machines,
      scores,
    );

    await useCase.execute(input);

    expect(machines.create).not.toHaveBeenCalled();
    expect(scores.saveFromPending).toHaveBeenCalledWith({
      value: 42000,
      machineId: "machine-1",
      userId: "user-1",
      createdAt: input.playedAt,
    });
  });

  it("auto-crée la Machine si mapId inconnu (name=mapId)", async () => {
    const machines = makeMachines({
      findByCheckpointAndMapId: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(makeMachine({ id: "machine-new" })),
    });
    const scores = makeScores();
    const useCase = new RecordAccountScore(
      makeCheckpoints(makeCheckpoint()),
      machines,
      scores,
    );

    await useCase.execute(input);

    expect(machines.create).toHaveBeenCalledWith({
      checkpointId: "cp-1",
      name: "strangerthings",
      mapId: "strangerthings",
    });
    expect(scores.saveFromPending).toHaveBeenCalledWith(
      expect.objectContaining({ machineId: "machine-new", createdAt: input.playedAt }),
    );
  });
});
