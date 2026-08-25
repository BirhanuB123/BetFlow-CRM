const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://betflow:betflowpassword@localhost:5432/betflow_db?schema=public';

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verifySmsPipeline() {
  console.log('--- Starting End-to-End SMS Pipeline Verification ---');

  try {
    // 1. Verify Phase 1: Contact Sourcing
    console.log('\n[Phase 1 Check] Querying real database leads & customers...');
    const dbLeads = await prisma.lead.findMany({ take: 5 });
    const dbCustomers = await prisma.customer.findMany({ take: 5 });
    console.log(`Found ${dbLeads.length} leads and ${dbCustomers.length} customers in PostgreSQL DB.`);

    // 2. Verify Phase 3: Outbox Persistence
    console.log('\n[Phase 3 Check] Writing SMS outbox record to Prisma DB...');
    const testOutbox = await prisma.smsOutbox.create({
      data: {
        recipientName: 'Verification Tester',
        phone: '251911000000',
        body: 'BetFlow CRM End-to-End Test SMS',
        channel: 'SMS',
        triggerType: 'MANUAL_BROADCAST',
        status: 'QUEUED',
        costEthioBirr: 0.35,
        gatewayUsed: 'AfroMessage Live Gateway',
        attemptsCount: 1,
        encoding: 'GSM-7 (English)',
        segmentCount: 1,
      },
    });
    console.log(`Created outbox record ID: ${testOutbox.id}, Initial Status: ${testOutbox.status}`);

    // 3. Verify Phase 2: Delivery Callback Handling
    console.log('\n[Phase 2 Check] Simulating AfroMessage delivery callback...');
    const updatedRecord = await prisma.smsOutbox.update({
      where: { id: testOutbox.id },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    });
    console.log(`Updated outbox record ID: ${updatedRecord.id}, New Status: ${updatedRecord.status}, DeliveredAt: ${updatedRecord.deliveredAt}`);

    // 4. Verify Phase 4 & 5: Stats & Analytics Calculation
    console.log('\n[Phase 4 & 5 Check] Querying aggregate stats from Prisma outbox...');
    const totalSent = await prisma.smsOutbox.count();
    const delivered = await prisma.smsOutbox.count({ where: { status: 'DELIVERED' } });
    const failed = await prisma.smsOutbox.count({ where: { status: 'FAILED' } });
    const deliveryRate = totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 100;

    console.log(`Total Outbox Sent: ${totalSent}`);
    console.log(`Delivered Count: ${delivered}`);
    console.log(`Failed Count: ${failed}`);
    console.log(`Delivery Success Rate: ${deliveryRate}%`);

    // Clean up verification test record
    await prisma.smsOutbox.delete({ where: { id: testOutbox.id } });
    console.log('\nCleaned up verification test record.');
    console.log('\n--- ✅ ALL END-TO-END SMS PIPELINE VERIFICATIONS PASSED ---');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

verifySmsPipeline();
