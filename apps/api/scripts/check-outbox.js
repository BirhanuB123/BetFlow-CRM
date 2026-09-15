const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[key] = value.trim();
    }
  });
  return env;
}

const rootEnv = loadEnv(path.join(__dirname, '..', '..', '.env'));
Object.assign(process.env, rootEnv);

const databaseUrl = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkLatestOutbox() {
  const latest = await prisma.smsOutbox.findMany({
    orderBy: { sentAt: 'desc' },
    take: 3
  });

  console.log("Recent Outbox Logs in Database:");
  latest.forEach((log, index) => {
    console.log(`\n[Log #${index + 1}] ID: ${log.id}`);
    console.log(`Recipient: ${log.recipientName} (${log.phone})`);
    console.log(`Status: ${log.status}`);
    console.log(`Gateway Details: ${log.gatewayUsed}`);
    console.log(`Sent At: ${log.sentAt}`);
  });

  await prisma.$disconnect();
  await pool.end();
}

checkLatestOutbox();
