"use server";

import prisma from "@/lib/prisma";

export async function getCheckpoints() {
  try {
    const checkpoints = await prisma.checkpoint.findMany({
      include: {
        machines: {
          include: {
            scores: {
              orderBy: {
                value: 'desc'
              },
              take: 5,
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Transformer pour le format attendu par Leaflet [lat, lng]
    return checkpoints.map(cp => ({
      ...cp,
      position: [cp.lat, cp.lng]
    }));
  } catch (error) {
    console.error("Error fetching checkpoints:", error);
    return [];
  }
}
