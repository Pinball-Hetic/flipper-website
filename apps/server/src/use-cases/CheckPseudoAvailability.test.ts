import { describe, it, expect, vi } from "vitest";
import { CheckPseudoAvailability } from "./CheckPseudoAvailability";
import type { IUserRepository } from "../domain/IUserRepository";
import type { IScoreRepository } from "../domain/IScoreRepository";

const makeUserRepo = (found: boolean): IUserRepository => ({
  findById: vi.fn(),
  findByPseudo: vi.fn().mockResolvedValue(found ? { id: "user-1" } : null),
  setPseudo: vi.fn(),
  list: vi.fn().mockResolvedValue([]),
  updateRole: vi.fn(),
});

const makeScoreRepo = (exists: boolean): IScoreRepository => ({
  save: vi.fn(),
  saveFromPending: vi.fn(),
  existsRecentScore: vi.fn().mockResolvedValue(false),
  findTopByUser: vi.fn().mockResolvedValue(null),
  existsByPseudo: vi.fn().mockResolvedValue(exists),
});

describe("CheckPseudoAvailability", () => {
  it("returns available:true when absent from both tables", async () => {
    const uc = new CheckPseudoAvailability(makeUserRepo(false), makeScoreRepo(false));
    expect(await uc.execute("freepseudo")).toEqual({ available: true });
  });

  it("returns available:false when pseudo found in User table", async () => {
    const uc = new CheckPseudoAvailability(makeUserRepo(true), makeScoreRepo(false));
    expect(await uc.execute("takenpseudo")).toEqual({ available: false });
  });

  it("returns available:false when pseudo matches anonymous Score", async () => {
    const uc = new CheckPseudoAvailability(makeUserRepo(false), makeScoreRepo(true));
    expect(await uc.execute("anonpseudo")).toEqual({ available: false });
  });

  it("normalizes pseudo to lowercase before checking", async () => {
    const userRepo = makeUserRepo(false);
    const scoreRepo = makeScoreRepo(false);
    const uc = new CheckPseudoAvailability(userRepo, scoreRepo);
    await uc.execute("MixedCase");
    expect(userRepo.findByPseudo).toHaveBeenCalledWith("mixedcase");
    expect(scoreRepo.existsByPseudo).toHaveBeenCalledWith("mixedcase");
  });

  it("checks both tables in parallel", async () => {
    const calls: string[] = [];
    const userRepo: IUserRepository = {
      findById: vi.fn(),
      findByPseudo: vi.fn().mockImplementation(async () => { calls.push("user"); return null; }),
      setPseudo: vi.fn(),
      list: vi.fn().mockResolvedValue([]),
      updateRole: vi.fn(),
    };
    const scoreRepo: IScoreRepository = {
      save: vi.fn(),
      saveFromPending: vi.fn(),
      existsRecentScore: vi.fn().mockResolvedValue(false),
      findTopByUser: vi.fn().mockResolvedValue(null),
      existsByPseudo: vi.fn().mockImplementation(async () => { calls.push("score"); return false; }),
    };
    const uc = new CheckPseudoAvailability(userRepo, scoreRepo);
    await uc.execute("test");
    expect(calls).toHaveLength(2);
  });
});
