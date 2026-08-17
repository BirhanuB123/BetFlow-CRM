import type { PrismaClient } from '@prisma/client';

export async function seedRealEstateInventory(prisma: PrismaClient) {
  const project = await prisma.project.upsert({
    where: { id: 'project_001' },
    update: {
      name: 'Harbor Heights',
      description:
        'Waterfront residential project with premium mixed-use inventory.',
      status: 'ACTIVE',
    },
    create: {
      id: 'project_001',
      name: 'Harbor Heights',
      description:
        'Waterfront residential project with premium mixed-use inventory.',
      status: 'ACTIVE',
    },
  });

  const building = await prisma.building.upsert({
    where: { id: 'building_001' },
    update: {
      projectId: project.id,
      name: 'Tower A',
      floorsCount: 18,
    },
    create: {
      id: 'building_001',
      projectId: project.id,
      name: 'Tower A',
      floorsCount: 18,
    },
  });

  const floor = await prisma.floor.upsert({
    where: { id: 'floor_001' },
    update: {
      buildingId: building.id,
      floorNumber: 8,
      name: 'Level 8',
    },
    create: {
      id: 'floor_001',
      buildingId: building.id,
      floorNumber: 8,
      name: 'Level 8',
    },
  });

  const units: [string, string, string, string, string, number][] = [
    ['unit_801', '801', 'APARTMENT', 'AVAILABLE', '420000.00', 122],
    ['unit_802', '802', 'APARTMENT', 'RESERVED', '465000.00', 136],
    ['unit_803', '803', 'APARTMENT', 'SOLD', '510000.00', 148],
  ];

  for (const [id, unitNumber, type, status, price, area] of units) {
    await prisma.unit.upsert({
      where: { id },
      update: {
        floorId: floor.id,
        unitNumber,
        type,
        status,
        price,
        area,
      },
      create: {
        id,
        floorId: floor.id,
        unitNumber,
        type,
        status,
        price,
        area,
      },
    });
  }

  return { project, building, floor };
}
