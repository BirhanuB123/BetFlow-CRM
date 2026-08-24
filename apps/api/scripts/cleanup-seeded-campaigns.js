const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://betflow:betflowpassword@localhost:5432/betflow_db?schema=public';

const pool = new Pool({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  const seededTitles = [
    'Bole Tower Site Progress & 80% Completion Milestone Update',
    'Exclusive Launch: 3-Bedroom Penthouse Units in Kazanchis',
    'CBE 30/70 Mortgage Pro-Forma Application Guidance',
  ];

  const deleted = await prisma.campaign.deleteMany({
    where: {
      name: {
        in: seededTitles,
      },
    },
  });

  console.log(`Deleted ${deleted.count} auto-seeded fake campaign(s) from database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
