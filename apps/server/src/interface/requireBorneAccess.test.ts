import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock l'auth (session + lookup user) pour tester la frontière d'autorisation.
const resolveSessionMock = vi.fn();
vi.mock("./resolveSession", () => ({
  resolveSession: (...args: unknown[]) => resolveSessionMock(...args),
}));

const findByIdMock = vi.fn();
vi.mock("../infrastructure/PrismaUserRepository", () => ({
  PrismaUserRepository: class {
    findById = findByIdMock;
  },
}));

import { requireBorneAccess } from "./requireBorneAccess";
import type { Checkpoint } from "../domain/Checkpoint";
import type { ICheckpointRepository } from "../domain/ICheckpointRepository";

const borne = (ownerUserId?: string): Checkpoint => ({
  id: "cp-1",
  name: "Borne",
  type: "OTHER",
  lat: 1,
  lng: 1,
  cabinetId: "brn_x",
  ownerUserId,
  createdAt: new Date(),
});

const checkpoints = (cp: Checkpoint | null): ICheckpointRepository =>
  ({ findById: vi.fn().mockResolvedValue(cp) }) as unknown as ICheckpointRepository;

const req = {} as never;

beforeEach(() => {
  resolveSessionMock.mockReset();
  findByIdMock.mockReset();
});

const asUser = (id: string, role: string) => {
  resolveSessionMock.mockResolvedValue(id);
  findByIdMock.mockResolvedValue({ id, pseudo: null, pseudoUpdatedAt: null, role });
};

describe("requireBorneAccess — frontière ownership", () => {
  it("401 si pas de session", async () => {
    resolveSessionMock.mockResolvedValue(null);
    const r = await requireBorneAccess(req, "cp-1", checkpoints(borne("m1")));
    expect(r).toEqual({ ok: false, status: 401 });
  });

  it("403 si role 'user' simple", async () => {
    asUser("u1", "user");
    const r = await requireBorneAccess(req, "cp-1", checkpoints(borne("u1")));
    expect(r).toEqual({ ok: false, status: 403 });
  });

  it("404 si borne inexistante (n'expose pas l'ownership)", async () => {
    asUser("m1", "manager");
    const r = await requireBorneAccess(req, "ghost", checkpoints(null));
    expect(r).toEqual({ ok: false, status: 404 });
  });

  it("manager → borne possédée : ok", async () => {
    asUser("m1", "manager");
    const r = await requireBorneAccess(req, "cp-1", checkpoints(borne("m1")));
    expect(r.ok).toBe(true);
  });

  it("CRITIQUE: manager → borne NON possédée : 403", async () => {
    asUser("m1", "manager");
    const r = await requireBorneAccess(req, "cp-1", checkpoints(borne("autre")));
    expect(r).toEqual({ ok: false, status: 403 });
  });

  it("manager → borne sans owner : 403", async () => {
    asUser("m1", "manager");
    const r = await requireBorneAccess(req, "cp-1", checkpoints(borne(undefined)));
    expect(r).toEqual({ ok: false, status: 403 });
  });

  it("admin → n'importe quelle borne (non possédée) : ok", async () => {
    asUser("a1", "admin");
    const r = await requireBorneAccess(req, "cp-1", checkpoints(borne("autre")));
    expect(r.ok).toBe(true);
  });
});
