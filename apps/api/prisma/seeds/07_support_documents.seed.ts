import type { PrismaClient } from '@prisma/client';

export async function seedSupportAndDocuments(
  prisma: PrismaClient,
  users: { owner: { id: string }; agent: { id: string }; finance: { id: string } },
  deals: { deal: { id: string } },
  financeData: { reservation: { id: string }; contract: { id: string } },
) {
  await prisma.document.upsert({
    where: { id: 'document_001' },
    update: {
      name: 'Reservation receipt - Unit 802',
      fileUrl: '/demo/documents/reservation-receipt-802.pdf',
      entityType: 'Reservation',
      entityId: financeData.reservation.id,
    },
    create: {
      id: 'document_001',
      name: 'Reservation receipt - Unit 802',
      fileUrl: '/demo/documents/reservation-receipt-802.pdf',
      entityType: 'Reservation',
      entityId: financeData.reservation.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task_001' },
    update: {
      title: 'Send signed contract reminder',
      description: 'Follow up with Nadia for contract signature.',
      dueDate: new Date('2026-07-03T17:00:00.000Z'),
      status: 'TODO',
      assigneeId: users.agent.id,
      entityType: 'Contract',
      entityId: financeData.contract.id,
    },
    create: {
      id: 'task_001',
      title: 'Send signed contract reminder',
      description: 'Follow up with Nadia for contract signature.',
      dueDate: new Date('2026-07-03T17:00:00.000Z'),
      status: 'TODO',
      assigneeId: users.agent.id,
      entityType: 'Contract',
      entityId: financeData.contract.id,
    },
  });

  await prisma.note.upsert({
    where: { id: 'note_001' },
    update: {
      content: 'Customer requested payment plan confirmation before signing.',
      authorId: users.agent.id,
      entityType: 'Deal',
      entityId: deals.deal.id,
    },
    create: {
      id: 'note_001',
      content: 'Customer requested payment plan confirmation before signing.',
      authorId: users.agent.id,
      entityType: 'Deal',
      entityId: deals.deal.id,
    },
  });

  await prisma.activity.upsert({
    where: { id: 'activity_001' },
    update: {
      type: 'reservation.approved',
      description: 'Reservation approved for Unit 802.',
      userId: users.finance.id,
      entityType: 'Reservation',
      entityId: financeData.reservation.id,
    },
    create: {
      id: 'activity_001',
      type: 'reservation.approved',
      description: 'Reservation approved for Unit 802.',
      userId: users.finance.id,
      entityType: 'Reservation',
      entityId: financeData.reservation.id,
    },
  });

  await prisma.campaign.upsert({
    where: { id: 'campaign_001' },
    update: {
      name: 'Harbor Heights July launch',
      type: 'EMAIL',
      status: 'ACTIVE',
      startDate: new Date('2026-07-01T00:00:00.000Z'),
      budget: '12000.00',
      cost: '3840.00',
    },
    create: {
      id: 'campaign_001',
      name: 'Harbor Heights July launch',
      type: 'EMAIL',
      status: 'ACTIVE',
      startDate: new Date('2026-07-01T00:00:00.000Z'),
      budget: '12000.00',
      cost: '3840.00',
    },
  });

  await prisma.notification.upsert({
    where: { id: 'notification_001' },
    update: {
      userId: users.owner.id,
      title: 'Demo tenant ready',
      message:
        'Seeded sample CRM, inventory, sales, payments, documents, and audit data.',
      isRead: false,
    },
    create: {
      id: 'notification_001',
      userId: users.owner.id,
      title: 'Demo tenant ready',
      message:
        'Seeded sample CRM, inventory, sales, payments, documents, and audit data.',
      isRead: false,
    },
  });
}
