import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import { seedAuthAndRbac } from './seeds/01_auth_rbac.seed';
import { seedCrmMasters } from './seeds/02_crm_masters.seed';
import { seedRealEstateInventory } from './seeds/03_real_estate.seed';
import { seedAccountsAndCustomers } from './seeds/04_accounts_customers.seed';
import { seedPipelineAndDeals } from './seeds/05_pipeline_deals.seed';
import { seedFinanceAndContracts } from './seeds/06_finance_contracts.seed';
import { seedSupportAndDocuments } from './seeds/07_support_documents.seed';
import { seedSaasAndSettings } from './seeds/08_saas_settings.seed';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://betflow:betflowpassword@localhost:5432/betflow_db?schema=public';
}

// Production safety guard
if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PROD_SEED) {
  console.error('⛔ FATAL: Database seeding is prohibited in production mode. Aborting to protect tenant data.');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL),
});

async function main() {
  console.log('🚀 Starting BetFlow CRM Database Seeding Sequence...\n');

  console.log(' 1/8 Seeding Roles, Permissions & User Accounts...');
  const users = await seedAuthAndRbac(prisma);

  console.log(' 2/8 Seeding CRM Master Entities (Lead Sources, Deal Stages)...');
  await seedCrmMasters(prisma);

  console.log(' 3/8 Seeding Real Estate Inventory (Projects, Buildings, Floors, Units)...');
  await seedRealEstateInventory(prisma);

  console.log(' 4/8 Seeding Enterprise Accounts & Customers...');
  const customers = await seedAccountsAndCustomers(prisma, users);

  console.log(' 5/8 Seeding Sales Pipeline, Leads & Deals...');
  const deals = await seedPipelineAndDeals(prisma, users, customers);

  console.log(' 6/8 Seeding Financial Reservations, Contracts & Milestone Schedules...');
  const financeData = await seedFinanceAndContracts(prisma, customers, deals);

  console.log(' 7/8 Seeding Support Systems (Documents, Tasks, Activities, Campaigns)...');
  await seedSupportAndDocuments(prisma, users, deals, financeData);

  console.log(' 8/8 Seeding SaaS Tenant & System Settings...');
  await seedSaasAndSettings(prisma);

  console.log('\n✅ BetFlow CRM Database Seeding Completed Successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
