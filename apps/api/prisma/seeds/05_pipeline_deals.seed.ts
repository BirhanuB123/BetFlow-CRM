import type { PrismaClient } from '@prisma/client';

export async function seedPipelineAndDeals(
  prisma: PrismaClient,
  users: { owner: { id: string }; agent: { id: string } },
  customers: { customer: { id: string }; secondCustomer: { id: string } },
) {
  const leadsData: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ][] = [
    [
      'lead_001',
      'Amira',
      'Saleh',
      'Harbor Realty Group',
      'amira.saleh@example.com',
      '+1 555 0201',
      'NEW',
      'source_website',
      users.owner.id,
    ],
    [
      'lead_002',
      'Diego',
      'Martinez',
      'Skyline Ventures',
      'diego.martinez@example.com',
      '+1 555 0202',
      'QUALIFIED',
      'source_meta',
      users.agent.id,
    ],
    [
      'lead_003',
      'Priya',
      'Kapoor',
      'Meridian Holdings',
      'priya.kapoor@example.com',
      '+1 555 0203',
      'FOLLOW_UP',
      'source_referral',
      users.agent.id,
    ],
  ];

  for (const [
    id,
    firstName,
    lastName,
    company,
    email,
    phone,
    status,
    sourceId,
    ownerId,
  ] of leadsData) {
    await prisma.lead.upsert({
      where: { id },
      update: {
        firstName,
        lastName,
        company,
        email,
        phone,
        status,
        sourceId,
        ownerId,
      },
      create: {
        id,
        firstName,
        lastName,
        company,
        email,
        phone,
        status,
        sourceId,
        ownerId,
      },
    });
  }

  const deal = await prisma.deal.upsert({
    where: { id: 'deal_001' },
    update: {
      accountId: 'account_001',
      name: 'Nadia Rahman - Unit 802',
      value: '465000.00',
      stageId: 'stage_reserved',
      customerId: customers.customer.id,
      unitId: 'unit_802',
    },
    create: {
      id: 'deal_001',
      name: 'Nadia Rahman - Unit 802',
      value: '465000.00',
      stageId: 'stage_reserved',
      customerId: customers.customer.id,
      unitId: 'unit_802',
    },
  });

  await prisma.deal.upsert({
    where: { id: 'deal_002' },
    update: {
      name: 'Victor Chen - Unit 801',
      value: '420000.00',
      stageId: 'stage_qualified',
      customerId: customers.secondCustomer.id,
      unitId: 'unit_801',
    },
    create: {
      id: 'deal_002',
      name: 'Victor Chen - Unit 801',
      value: '420000.00',
      stageId: 'stage_qualified',
      customerId: customers.secondCustomer.id,
      unitId: 'unit_801',
    },
  });

  await prisma.siteVisit.upsert({
    where: { id: 'visit_001' },
    update: {
      customerId: customers.customer.id,
      date: new Date('2026-07-02T15:00:00.000Z'),
      status: 'SCHEDULED',
      notes: 'Tour Tower A amenities and Unit 802.',
    },
    create: {
      id: 'visit_001',
      customerId: customers.customer.id,
      date: new Date('2026-07-02T15:00:00.000Z'),
      status: 'SCHEDULED',
      notes: 'Tour Tower A amenities and Unit 802.',
    },
  });

  return { deal };
}
