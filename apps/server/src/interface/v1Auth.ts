import type { Request } from "express";

export function checkBearer(req: Request): boolean {
  const expected = process.env.CABINET_KEY ?? process.env.BORNE_API_KEY;
  if (!expected) return false;

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return false;

  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 && token === expected;
}
