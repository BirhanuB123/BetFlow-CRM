import type { PrismaClient } from '@prisma/client';

export async function seedCrmMasters(prisma: PrismaClient) {
  const sources = [
    ['source_website', 'Website'],
    ['source_meta', 'Facebook/Instagram'],
    ['source_referral', 'Referral'],
  ];

  for (const [id, name] of sources) {
    await prisma.leadSource.upsert({
      where: { id },
      update: { name },
      create: { id, name },
    });
  }

  const stages: [string, string, number, number][] = [
    ['stage_new', 'New inquiry', 1, 10],
    ['stage_qualified', 'Qualified', 2, 35],
    ['stage_reserved', 'Reserved', 3, 70],
    ['stage_contract', 'Contracting', 4, 90],
  ];

  for (const [id, name, order, probability] of stages) {
    await prisma.dealStage.upsert({
      where: { id },
      update: { name, order, probability },
      create: { id, name, order, probability },
    });
  }
}
