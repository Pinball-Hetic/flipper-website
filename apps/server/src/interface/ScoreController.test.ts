import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response } from "express";
import { ScoreController } from "./ScoreController";
import { MachineNotFoundError, ValidationError } from "../use-cases/RegisterScore";

// Mock infrastructure to avoid real DB calls
vi.mock("../infrastructure/PrismaScoreRepository", () => ({
  PrismaScoreRepository: vi.fn(),
}));
vi.mock("../infrastructure/PrismaMachineRepository", () => ({
  PrismaMachineRepository: vi.fn(),
}));

// Mock RegisterScore use case
vi.mock("../use-cases/RegisterScore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../use-cases/RegisterScore")>();
  return {
    ...actual,
    RegisterScore: vi.fn(),
  };
});

import { RegisterScore } from "../use-cases/RegisterScore";

const makeReq = (overrides: Partial<Request> = {}): Request =>
  ({
    headers: { "x-api-key": "test-key" },
    body: { borneId: "machine-1", pseudo: "Player1", score: 1000 },
    ...overrides,
  }) as unknown as Request;

const makeRes = (): Response => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
};

describe("ScoreController", () => {
  const originalEnv = process.env.BORNE_API_KEY;

  beforeEach(() => {
    process.env.BORNE_API_KEY = "test-key";
  });

  afterEach(() => {
    process.env.BORNE_API_KEY = originalEnv;
    vi.clearAllMocks();
  });

  it("répond 201 pour une requête valide avec le bon api-key", async () => {
    const mockScore = {
      id: "score-1",
      value: 1000,
      machineId: "machine-1",
      createdAt: new Date(),
    };
    vi.mocked(RegisterScore).mockImplementation(
      () => ({ execute: vi.fn().mockResolvedValue(mockScore) }) as never,
    );

    const req = makeReq();
    const res = makeRes();

    await ScoreController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: "score-1" }));
  });

  it("répond 401 si l'api-key est absent", async () => {
    const req = makeReq({ headers: {} });
    const res = makeRes();

    await ScoreController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  it("répond 404 si MachineNotFoundError", async () => {
    vi.mocked(RegisterScore).mockImplementation(
      () =>
        ({ execute: vi.fn().mockRejectedValue(new MachineNotFoundError("x")) }) as never,
    );

    const req = makeReq();
    const res = makeRes();

    await ScoreController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("répond 400 si ValidationError", async () => {
    vi.mocked(RegisterScore).mockImplementation(
      () =>
        ({ execute: vi.fn().mockRejectedValue(new ValidationError("bad input")) }) as never,
    );

    const req = makeReq();
    const res = makeRes();

    await ScoreController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
