// Bootstrap : promeut un utilisateur existant au rôle "admin".
//
// Usage (depuis la racine du monorepo) :
//   npm run db:make-admin -w @pocket-maps/database -- you@example.com
// ou via Taskfile :
//   task db:make-admin EMAIL=you@example.com
//
// L'utilisateur doit déjà exister (s'être inscrit au moins une fois).
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const dotenv = require('dotenv');

dotenv.config({ override: true });

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('❌ Email requis. Usage: db:make-admin -- you@example.com');
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'admin' },
  });

  console.log(`✅ ${user.email} est maintenant admin (role="${user.role}").`);
}

main()
  .catch((e) => {
    if (e.code === 'P2025') {
      console.error('❌ Aucun utilisateur avec cet email.');
    } else {
      console.error('❌ Échec:', e);
    }
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
