import type { PrismaClient } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require("@pocket-maps/database") as { prisma: PrismaClient };

export { prisma };
