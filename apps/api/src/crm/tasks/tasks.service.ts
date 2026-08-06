import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateTaskInput,
  TASK_STATUSES,
  TaskStatus,
  UpdateTaskInput,
} from './tasks.types';

const taskInclude = {
  assignee: { select: { id: true, firstName: true, lastName: true } },
} as const;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  list(filters: { status?: string; assigneeId?: string; open?: boolean } = {}) {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = this.normalizeStatus(filters.status);
    else if (filters.open) where.status = { not: 'DONE' };
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;

    return this.prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: [{ dueDate: 'asc' }],
    });
  }

  async get(id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id },
      include: taskInclude,
    });

    if (!task) {
      throw new NotFoundException(`Task ${id} was not found`);
    }

    return task;
  }

  async create(userId: string, input: CreateTaskInput) {
    const title = input.title?.trim();
    if (!title) throw new BadRequestException('title is required');

    const status = this.normalizeStatus(input.status ?? 'TODO');

    if (input.assigneeId) {
      await this.assertUserExists(input.assigneeId);
    }

    const task = await this.prisma.task.create({
      data: {
        title,
        description: input.description?.trim() || null,
        dueDate: input.dueDate ? this.normalizeDate(input.dueDate) : null,
        status,
        priority: input.priority || 'MEDIUM',
        category: input.category || 'CLIENT_FOLLOWUP',
        assigneeId: input.assigneeId || null,
        entityType: input.entityType || null,
        entityId: input.entityId || null,
      },
      include: taskInclude,
    });

    if (task.assigneeId) {
      await this.prisma.notification.create({
        data: {
          userId: task.assigneeId,
          title: 'Task Assigned',
          message: `You have been assigned the task: ${task.title}.`,
        },
      });
    }

    await this.recordAudit(userId, 'task.created', task.id);

    return task;
  }

  async update(userId: string, id: string, input: UpdateTaskInput) {
    const existing = await this.prisma.task.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Task ${id} was not found`);
    }

    if (input.assigneeId) {
      await this.assertUserExists(input.assigneeId);
    }

    const data: Record<string, unknown> = {};
    if (input.title !== undefined) {
      const title = input.title.trim();
      if (!title) throw new BadRequestException('title cannot be empty');
      data.title = title;
    }
    if (input.description !== undefined)
      data.description = input.description?.trim() || null;
    if (input.dueDate !== undefined)
      data.dueDate = input.dueDate ? this.normalizeDate(input.dueDate) : null;
    if (input.status !== undefined)
      data.status = this.normalizeStatus(input.status);
    if (input.priority !== undefined) data.priority = input.priority;
    if (input.category !== undefined) data.category = input.category;
    if (input.assigneeId !== undefined)
      data.assigneeId = input.assigneeId || null;
    if (input.entityType !== undefined)
      data.entityType = input.entityType || null;
    if (input.entityId !== undefined) data.entityId = input.entityId || null;

    const task = await this.prisma.task.update({
      where: { id },
      data,
      include: taskInclude,
    });

    if (task.assigneeId && task.assigneeId !== existing.assigneeId) {
      await this.prisma.notification.create({
        data: {
          userId: task.assigneeId,
          title: 'Task Assigned',
          message: `You have been assigned the task: ${task.title}.`,
        },
      });
    }

    await this.recordAudit(userId, 'task.updated', task.id);

    return task;
  }

  async updateStatus(userId: string, id: string, status: string) {
    const normalized = this.normalizeStatus(status);
    const existing = await this.prisma.task.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Task ${id} was not found`);
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: { status: normalized },
      include: taskInclude,
    });

    await this.recordAudit(userId, 'task.status_changed', task.id, {
      from: existing.status,
      to: normalized,
    });

    return task;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.task.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Task ${id} was not found`);
    }

    await this.prisma.task.delete({ where: { id } });
    await this.recordAudit(userId, 'task.deleted', id);

    return { id, deleted: true };
  }

  private normalizeStatus(status: string): TaskStatus {
    const upper = status?.trim().toUpperCase().replace(/\s+/g, '_');

    if (!TASK_STATUSES.includes(upper as TaskStatus)) {
      throw new BadRequestException(
        `status must be one of: ${TASK_STATUSES.join(', ')}`,
      );
    }

    return upper as TaskStatus;
  }

  private normalizeDate(value: string): Date {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) {
      throw new BadRequestException('dueDate must be a valid date');
    }
    return date;
  }

  private async assertUserExists(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException(`User ${userId} was not found`);
    }
  }

  private recordAudit(
    userId: string,
    action: string,
    entityId: string,
    newValues?: Record<string, string>,
  ) {
    return this.prisma.auditLog.create({
      data: { userId, action, entityType: 'Task', entityId, newValues },
    });
  }
}
