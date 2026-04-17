import type { Request, Response } from "express";
import { ClaimScore, NotFoundError, AlreadyClaimedError, ExpiredCodeError } from "../use-cases/ClaimScore";
import { ValidationError } from "../use-cases/RegisterScore";
import { PrismaPendingScoreRepository } from "../infrastructure/PrismaPendingScoreRepository";
import { PrismaScoreRepository } from "../infrastructure/PrismaScoreRepository";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS).unref();

function checkRateLimit(ip: string): { allowed: boolean; minutesLeft: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, minutesLeft: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const minutesLeft = Math.ceil((entry.resetAt - now) / 60_000);
    return { allowed: false, minutesLeft };
  }

  entry.count++;
  return { allowed: true, minutesLeft: 0 };
}

async function resolveSession(req: Request): Promise<string | null> {
  const authUrl = process.env.AUTH_URL ?? "http://localhost:8888";

  try {
    const headers: Record<string, string> = {};
    if (req.headers.cookie) headers["cookie"] = req.headers.cookie;
    if (req.headers.authorization) headers["authorization"] = req.headers.authorization;

    const res = await fetch(`${authUrl}/api/auth/get-session`, { headers });
    if (!res.ok) return null;

    const data = (await res.json()) as { user?: { id?: string } } | null;
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

export class ClaimController {
  static async handle(req: Request, res: Response): Promise<void> {
    const ip = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim()
      ?? req.socket.remoteAddress
      ?? "unknown";

    const { allowed, minutesLeft } = checkRateLimit(ip);
    if (!allowed) {
      res.status(429).json({ error: `Trop de tentatives. Réessaie dans ${minutesLeft} minutes.` });
      return;
    }

    const userId = await resolveSession(req);
    if (!userId) {
      res.status(401).json({ error: "Authentification requise" });
      return;
    }

    const useCase = new ClaimScore(
      new PrismaPendingScoreRepository(),
      new PrismaScoreRepository(),
    );

    try {
      const score = await useCase.execute({ claimCode: req.body.claimCode, userId });
      res.status(200).json({
        scoreId: score.id,
        value: score.value,
        machineId: score.machineId,
        claimedAt: score.createdAt,
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400).json({ error: err.message });
      } else if (err instanceof NotFoundError) {
        res.status(404).json({ error: err.message });
      } else if (err instanceof AlreadyClaimedError) {
        res.status(409).json({ error: err.message });
      } else if (err instanceof ExpiredCodeError) {
        res.status(410).json({ error: err.message });
      } else {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}
