import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

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
}
