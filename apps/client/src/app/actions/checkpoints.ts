"use server";

import type { CheckpointWithPosition } from "@pocket-maps/shared";
import { prisma } from "@/lib/prisma";

/**
 * Même requête que `apps/server/src/repositories/checkpointRepository.ts` (findAllWithScores).
 * On retire `location` (PostGIS Unsupported) avant JSON pour éviter des erreurs de sérialisation
 * côté Server Action. Pas de fetch vers :8882 → pas de 500 si l’API Express est arrêtée.
 */
export async function getCheckpoints(): Promise<CheckpointWithPosition[]> {
  const rows = await prisma.checkpoint.findMany({
    include: {
      machines: {
        include: {
          scores: {
            orderBy: { value: "desc" },
            take: 5,
            include: {
              user: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  const withoutLocation = rows.map((c: (typeof rows)[number]) => {
    const { location: _loc, ...rest } = c as typeof c & { location?: unknown };
    return rest;
  });

  const plain = JSON.parse(JSON.stringify(withoutLocation)) as Array<
    Omit<CheckpointWithPosition, "position">
  >;

  return plain.map((cp) => ({
    ...cp,
    position: [cp.lat, cp.lng] as [number, number],
  }));
}
