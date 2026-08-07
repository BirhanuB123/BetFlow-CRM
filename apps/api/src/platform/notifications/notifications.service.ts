import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { userId: string; title: string; message: string }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
      },
    });
  }

  async markAsRead(userId: string, id: string, isRead = true) {
    const existing = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException(`Notification ${id} was not found`);
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead },
    });
  }

  async delete(userId: string, id: string) {
    const existing = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException(`Notification ${id} was not found`);
    }

    await this.prisma.notification.delete({ where: { id } });
    return { id, deleted: true };
  }

  async listOverduePayments() {
    const now = new Date();
    const schedules = await this.prisma.paymentSchedule.findMany({
      where: {
        status: { in: ['PENDING', 'OVERDUE', 'PARTIALLY_PAID'] },
        dueDate: { lt: now },
      },
      include: {
        contract: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return schedules.map((s) => {
      const diffMs = now.getTime() - s.dueDate.getTime();
      const overdueDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const remainingAmount = Number(s.amount) - Number(s.paidAmount);

      return {
        id: s.id,
        contractId: s.contractId,
        contractNumber: s.contract.contractNumber,
        customerName:
          `${s.contract.customer.firstName} ${s.contract.customer.lastName}`.trim(),
        amount: remainingAmount,
        dueDate: s.dueDate.toISOString().split('T')[0],
        overdueByDays: overdueDays,
        milestoneName: s.milestoneName,
        status: s.status,
      };
    });
  }

  async listFollowUps() {
    const now = new Date();
    const tasks = await this.prisma.task.findMany({
      where: {
        status: { not: 'DONE' },
        dueDate: { lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      dueDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : null,
      priority: t.priority,
      status: t.status,
      category: t.category,
      entityType: t.entityType,
      entityId: t.entityId,
      assigneeName: t.assignee
        ? `${t.assignee.firstName} ${t.assignee.lastName}`.trim()
        : 'Unassigned',
    }));
  }
}
