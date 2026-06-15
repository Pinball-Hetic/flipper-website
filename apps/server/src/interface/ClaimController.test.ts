import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

// Mock repositories
vi.mock("../infrastructure/PrismaPendingScoreRepository");
vi.mock("../infrastructure/PrismaScoreRepository");

import { ClaimController } from "./ClaimController";
import { PrismaPendingScoreRepository } from "../infrastructure/PrismaPendingScoreRepository";
import {
  AlreadyClaimedError,
  ExpiredCodeError,
} from "../use-cases/ClaimScore";

function makeRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: { cookie: "better-auth.session_token=valid-token" },
    body: { claimCode: "ABC123" },
    socket: { remoteAddress: "127.0.0.1" },
    ...overrides,
  } as unknown as Request;
}

function mockFetch(userId: string | null) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: userId !== null,
      json: vi.fn().mockResolvedValue(userId ? { user: { id: userId } } : null),
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("ClaimController", () => {
  it("retourne 401 si aucune session", async () => {
    mockFetch(null);

    const req = makeReq({ headers: {} });
    const res = makeRes();

    await ClaimController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentification requise" });
  });

  it("retourne 429 si rate limit dépassé", async () => {
    mockFetch("user-1");

    const ip = `test-ip-ratelimit-${Date.now()}`;
    const req = makeReq({
      headers: {
        cookie: "better-auth.session_token=valid-token",
        "x-forwarded-for": ip,
      },
    });
    const res = makeRes();

    for (let i = 0; i < 10; i++) {
      await ClaimController.handle(req, res);
    }

    vi.clearAllMocks();
    mockFetch("user-1");

    await ClaimController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(429);
  });

  it("retourne 409 si AlreadyClaimedError", async () => {
    mockFetch("user-1");

    vi.mocked(PrismaPendingScoreRepository).mockImplementation(
      () =>
        ({
          findByCode: vi.fn(),
          findByGameId: vi.fn(),
          save: vi.fn(),
          findExpired: vi.fn(),
          claimIfUnclaimed: vi.fn(),
          markClaimed: vi.fn(),
          markExpired: vi.fn(),
        }) as never,
    );

    const { ClaimScore } = await import("../use-cases/ClaimScore");
    vi.spyOn(ClaimScore.prototype, "execute").mockRejectedValue(
      new AlreadyClaimedError("Déjà réclamé"),
    );

    const req = makeReq({
      headers: {
        cookie: "better-auth.session_token=valid-token",
        "x-forwarded-for": `ip-409-${Date.now()}`,
      },
    });
    const res = makeRes();

    await ClaimController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("retourne 410 si ExpiredCodeError", async () => {
    mockFetch("user-1");

    const { ClaimScore } = await import("../use-cases/ClaimScore");
    vi.spyOn(ClaimScore.prototype, "execute").mockRejectedValue(
      new ExpiredCodeError("Code expiré"),
    );

    const req = makeReq({
      headers: {
        cookie: "better-auth.session_token=valid-token",
        "x-forwarded-for": `ip-410-${Date.now()}`,
      },
    });
    const res = makeRes();

    await ClaimController.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(410);
  });
});
