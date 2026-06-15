import { describe, it, expect, vi } from "vitest";
import { CreateBorne, CabinetIdGenerationError } from "./CreateBorne";
import { UpdateBorne, CheckpointNotFoundError } from "./UpdateBorne";
import { ListBornes } from "./ListBornes";
import { GetBorne } from "./GetBorne";
import { GenerateBorneToken, hashToken } from "./GenerateBorneToken";
import { RevokeBorneToken } from "./RevokeBorneToken";
import { ValidationError } from "./RegisterScore";
import type { Checkpoint } from "../domain/Checkpoint";
import type { ICheckpointRepository } from "../domain/ICheckpointRepository";

const makeCheckpoint = (overrides: Partial<Checkpoint> = {}): Checkpoint => ({
  id: "cp-1",
  name: "Le Perchoir",
  type: "OTHER",
  lat: 48.86,
  lng: 2.38,
  cabinetId: "brn_abcd1234",
  createdAt: new Date("2026-06-17T09:00:00.000Z"),
  ...overrides,
});

const makeRepo = (
  overrides: Partial<ICheckpointRepository> = {},
): ICheckpointRepository => ({
  create: vi.fn().mockImplementation(async (data) => makeCheckpoint(data)),
  update: vi.fn().mockImplementation(async (id, data) => makeCheckpoint({ id, ...data })),
  findById: vi.fn().mockResolvedValue(makeCheckpoint()),
  findByCabinetId: vi.fn().mockResolvedValue(null),
  findByTokenHash: vi.fn().mockResolvedValue(null),
  list: vi.fn().mockResolvedValue([makeCheckpoint()]),
  existsByCabinetId: vi.fn().mockResolvedValue(false),
  setToken: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("CreateBorne", () => {
  it("crée une borne avec un cabinetId généré", async () => {
    const repo = makeRepo();
    const useCase = new CreateBorne(repo);
    const result = await useCase.execute({ name: "Bar", lat: 48.8, lng: 2.3 });

    expect(result.cabinetId).toMatch(/^brn_[0-9a-z]{8}$/);
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Bar",
        type: "OTHER",
        lat: 48.8,
        lng: 2.3,
        cabinetId: result.cabinetId,
      }),
    );
  });

  it("propage ownerUserId quand fourni", async () => {
    const repo = makeRepo();
    const useCase = new CreateBorne(repo);
    await useCase.execute({ name: "Bar", lat: 1, lng: 1, ownerUserId: "user-9" });
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ ownerUserId: "user-9" }),
    );
  });

  it("lève ValidationError si lat hors bornes", async () => {
    const useCase = new CreateBorne(makeRepo());
    await expect(useCase.execute({ name: "X", lat: 100, lng: 2 })).rejects.toThrow(
      ValidationError,
    );
  });

  it("lève ValidationError si name vide", async () => {
    const useCase = new CreateBorne(makeRepo());
    await expect(useCase.execute({ name: "", lat: 1, lng: 1 })).rejects.toThrow(
      ValidationError,
    );
  });

  it("retente sur collision de cabinetId", async () => {
    const existsByCabinetId = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    const repo = makeRepo({ existsByCabinetId });
    const useCase = new CreateBorne(repo);
    await useCase.execute({ name: "Bar", lat: 1, lng: 1 });
    expect(existsByCabinetId).toHaveBeenCalledTimes(2);
  });

  it("lève CabinetIdGenerationError après 10 collisions", async () => {
    const repo = makeRepo({ existsByCabinetId: vi.fn().mockResolvedValue(true) });
    const useCase = new CreateBorne(repo);
    await expect(useCase.execute({ name: "Bar", lat: 1, lng: 1 })).rejects.toThrow(
      CabinetIdGenerationError,
    );
  });
});

describe("UpdateBorne", () => {
  it("met à jour la position", async () => {
    const repo = makeRepo();
    const useCase = new UpdateBorne(repo);
    const result = await useCase.execute({ id: "cp-1", lat: 10, lng: 20 });
    expect(repo.update).toHaveBeenCalledWith("cp-1", { lat: 10, lng: 20 });
    expect(result.lat).toBe(10);
  });

  it("lève CheckpointNotFoundError si absente", async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
    const useCase = new UpdateBorne(repo);
    await expect(useCase.execute({ id: "ghost", lat: 1 })).rejects.toThrow(
      CheckpointNotFoundError,
    );
  });

  it("lève ValidationError si lng hors bornes", async () => {
    const useCase = new UpdateBorne(makeRepo());
    await expect(useCase.execute({ id: "cp-1", lng: 999 })).rejects.toThrow(
      ValidationError,
    );
  });
});

describe("ListBornes", () => {
  it("liste toutes les bornes", async () => {
    const repo = makeRepo();
    const useCase = new ListBornes(repo);
    const result = await useCase.execute();
    expect(result).toHaveLength(1);
    expect(repo.list).toHaveBeenCalledWith({});
  });

  it("filtre par ownerUserId", async () => {
    const repo = makeRepo();
    const useCase = new ListBornes(repo);
    await useCase.execute({ ownerUserId: "user-1" });
    expect(repo.list).toHaveBeenCalledWith({ ownerUserId: "user-1" });
  });
});

describe("GetBorne", () => {
  it("retourne la borne", async () => {
    const useCase = new GetBorne(makeRepo());
    const result = await useCase.execute("cp-1");
    expect(result.id).toBe("cp-1");
  });

  it("lève CheckpointNotFoundError si absente", async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
    const useCase = new GetBorne(repo);
    await expect(useCase.execute("ghost")).rejects.toThrow(CheckpointNotFoundError);
  });
});

describe("GenerateBorneToken", () => {
  it("génère un token brk_ et persiste seulement son hash", async () => {
    const repo = makeRepo();
    const useCase = new GenerateBorneToken(repo);
    const { token } = await useCase.execute("cp-1");

    expect(token).toMatch(/^brk_[0-9a-f]{64}$/);
    const [id, storedHash, createdAt] = (repo.setToken as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(id).toBe("cp-1");
    expect(storedHash).toBe(hashToken(token));
    expect(storedHash).not.toBe(token);
    expect(createdAt).toBeInstanceOf(Date);
  });

  it("lève CheckpointNotFoundError si borne absente", async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
    const useCase = new GenerateBorneToken(repo);
    await expect(useCase.execute("ghost")).rejects.toThrow(CheckpointNotFoundError);
    expect(repo.setToken).not.toHaveBeenCalled();
  });

  it("rotation : régénérer écrase l'ancien token", async () => {
    const repo = makeRepo();
    const useCase = new GenerateBorneToken(repo);
    const a = await useCase.execute("cp-1");
    const b = await useCase.execute("cp-1");
    expect(a.token).not.toBe(b.token);
    expect(repo.setToken).toHaveBeenCalledTimes(2);
  });
});

describe("RevokeBorneToken", () => {
  it("révoque en mettant le token à null", async () => {
    const repo = makeRepo();
    const useCase = new RevokeBorneToken(repo);
    await useCase.execute("cp-1");
    expect(repo.setToken).toHaveBeenCalledWith("cp-1", null, null);
  });

  it("lève CheckpointNotFoundError si borne absente", async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
    const useCase = new RevokeBorneToken(repo);
    await expect(useCase.execute("ghost")).rejects.toThrow(CheckpointNotFoundError);
    expect(repo.setToken).not.toHaveBeenCalled();
  });
});
