const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const dotenv = require('dotenv');

// Load .env
dotenv.config({ override: true });

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Clean up (Order matters for foreign keys)
  await prisma.score.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.checkpoint.deleteMany();

  // 2. Create Checkpoints (Locations)
  console.log('Creating locations...');
  
  await prisma.checkpoint.create({
    data: {
      name: "Le Perchoir",
      description: "Bar rooftop avec vue panoramique.",
      type: "RESTAURANT",
      address: "14 Rue Crespin du Gast, 75011 Paris",
      lat: 48.8631,
      lng: 2.3801,
      machines: {
        create: [
          { name: "Medieval Madness" },
          { name: "Attack from Mars" }
        ]
      }
    }
  });

  await prisma.checkpoint.create({
    data: {
      name: "Ground Control",
      description: "Lieu de vie culturel et gastronomique.",
      type: "CULTURE",
      address: "81 Rue du Charolais, 75012 Paris",
      lat: 48.8441,
      lng: 2.3732,
      machines: {
        create: [
          { name: "The Addams Family" },
          { name: "Twilight Zone" }
        ]
      }
    }
  });

  await prisma.checkpoint.create({
    data: {
      name: "Gare de Lyon",
      description: "Grande gare parisienne.",
      type: "STATION",
      address: "Place Louis-Armand, 75012 Paris",
      lat: 48.8448,
      lng: 2.3735,
      machines: {
        create: [
          { name: "Star Wars (Stern)" }
        ]
      }
    }
  });

  console.log('✅ Seed finished.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
