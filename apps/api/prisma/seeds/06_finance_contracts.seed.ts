import type { PrismaClient } from '@prisma/client';

export async function seedFinanceAndContracts(
  prisma: PrismaClient,
  customers: { customer: { id: string } },
  deals: { deal: { id: string } },
) {
  const reservation = await prisma.reservation.upsert({
    where: { id: 'reservation_001' },
    update: {
      customerId: customers.customer.id,
      unitId: 'unit_802',
      amount: '25000.00',
      status: 'APPROVED',
      date: new Date('2026-06-30T10:00:00.000Z'),
    },
    create: {
      id: 'reservation_001',
      customerId: customers.customer.id,
      unitId: 'unit_802',
      amount: '25000.00',
      status: 'APPROVED',
      date: new Date('2026-06-30T10:00:00.000Z'),
    },
  });

  const contract = await prisma.contract.upsert({
    where: { id: 'contract_001' },
    update: {
      customerId: customers.customer.id,
      unitId: 'unit_802',
      dealId: deals.deal.id,
      startDate: new Date('2026-07-01T00:00:00.000Z'),
      totalAmt: '465000.00',
      status: 'PENDING_SIGNATURE',
    },
    create: {
      id: 'contract_001',
      customerId: customers.customer.id,
      unitId: 'unit_802',
      dealId: deals.deal.id,
      startDate: new Date('2026-07-01T00:00:00.000Z'),
      totalAmt: '465000.00',
      status: 'PENDING_SIGNATURE',
    },
  });

  await prisma.payment.upsert({
    where: { id: 'payment_001' },
    update: {
      reservationId: reservation.id,
      amount: '25000.00',
      method: 'TRANSFER',
      status: 'COMPLETED',
      date: new Date('2026-06-30T11:15:00.000Z'),
    },
    create: {
      id: 'payment_001',
      reservationId: reservation.id,
      amount: '25000.00',
      method: 'TRANSFER',
      status: 'COMPLETED',
      date: new Date('2026-06-30T11:15:00.000Z'),
    },
  });

  const schedules = [
    ['schedule_001', '2026-07-15T00:00:00.000Z', '90000.00', 'PENDING'],
    ['schedule_002', '2026-08-15T00:00:00.000Z', '175000.00', 'PENDING'],
    ['schedule_003', '2026-09-15T00:00:00.000Z', '175000.00', 'PENDING'],
  ];

  for (const [id, dueDate, amount, status] of schedules) {
    await prisma.paymentSchedule.upsert({
      where: { id },
      update: {
        contractId: contract.id,
        dueDate: new Date(dueDate),
        amount,
        status,
      },
      create: {
        id,
        contractId: contract.id,
        dueDate: new Date(dueDate),
        amount,
        status,
      },
    });
  }

  return { reservation, contract };
}
