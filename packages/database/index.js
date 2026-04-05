const { PrismaClient } = require('@prisma/client');
const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });
};

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

module.exports = { prisma };

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
