import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateCallInput,
  CompleteCallInput,
  CALL_STATUSES,
  CallStatus,
  UpdateCallInput,
} from './calls.types';

const callInclude = {
  lead: { select: { id: true, firstName: true, lastName: true, phone: true } },
  customer: {
    select: { id: true, firstName: true, lastName: true, phone: true },
  },
} as const;

@Injectable()
export class CallsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    filters: { status?: string; dueToday?: boolean; overdue?: boolean } = {},
  ) {
    const where: Record<string, unknown> = {};
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );

    if (filters.status) {
      where.status = this.normalizeStatus(filters.status);
    }

    if (filters.dueToday) {
      where.dueDate = { gte: startOfDay, lte: endOfDay };
    } else if (filters.overdue) {
      where.status = 'PENDING';
      where.dueDate = { lt: startOfDay };
    }

    const calls = await this.prisma.callLog.findMany({
      where,
      include: callInclude,
      orderBy: { dueDate: 'asc' },
    });

    // Auto update PENDING past-due calls to OVERDUE status
    return calls.map((c) => {
      if (c.status === 'PENDING' && new Date(c.dueDate) < startOfDay) {
        return { ...c, status: 'OVERDUE' };
      }
      return c;
    });
  }

  async get(id: string) {
    const call = await this.prisma.callLog.findFirst({
      where: { id },
      include: callInclude,
    });

    if (!call) {
      throw new NotFoundException(`Call record ${id} was not found`);
    }

    return call;
  }

  async create(userId: string, input: CreateCallInput) {
    const dueDate = this.normalizeDate(input.dueDate);
    const subject = input.subject?.trim();
    if (!subject) {
      throw new BadRequestException('Call subject is required');
    }

    const leadId = input.leadId || null;
    const customerId = input.customerId || null;
    if (!leadId && !customerId) {
      throw new BadRequestException(
        'A call log must reference a lead or a customer',
      );
    }

    const call = await this.prisma.callLog.create({
      data: {
        subject,
        callType: input.callType || 'OUTBOUND',
        callPurpose: input.callPurpose || 'POST_VISIT_FOLLOWUP',
        callResult: input.callResult || null,
        dueDate,
        durationSeconds: input.durationSeconds
          ? Number(input.durationSeconds)
          : null,
        notes: input.notes?.trim() || null,
        status: 'PENDING',
        leadId,
        customerId,
      },
      include: callInclude,
    });

    await this.recordAudit(userId, 'call_log.created', call.id);

    return call;
  }

  async complete(userId: string, id: string, input: CompleteCallInput) {
    const existing = await this.prisma.callLog.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Call record ${id} was not found`);
    }

    const call = await this.prisma.callLog.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        callResult: input.callResult || existing.callResult || 'INTERESTED',
        notes: input.notes ? input.notes.trim() : existing.notes,
        durationSeconds: input.durationSeconds
          ? Number(input.durationSeconds)
          : existing.durationSeconds,
      },
      include: callInclude,
    });

    await this.recordAudit(userId, 'call_log.completed', call.id);

    return call;
  }

  async update(userId: string, id: string, input: UpdateCallInput) {
    const existing = await this.prisma.callLog.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Call record ${id} was not found`);
    }

    const data: Record<string, unknown> = {};
    if (input.subject !== undefined) data.subject = input.subject.trim();
    if (input.callType !== undefined) data.callType = input.callType;
    if (input.callPurpose !== undefined) data.callPurpose = input.callPurpose;
    if (input.callResult !== undefined) data.callResult = input.callResult;
    if (input.dueDate !== undefined)
      data.dueDate = this.normalizeDate(input.dueDate);
    if (input.durationSeconds !== undefined)
      data.durationSeconds = input.durationSeconds
        ? Number(input.durationSeconds)
        : null;
    if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
    if (input.leadId !== undefined) data.leadId = input.leadId || null;
    if (input.customerId !== undefined)
      data.customerId = input.customerId || null;

    const call = await this.prisma.callLog.update({
      where: { id },
      data,
      include: callInclude,
    });

    await this.recordAudit(userId, 'call_log.updated', call.id);

    return call;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.callLog.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Call record ${id} was not found`);
    }

    await this.prisma.callLog.delete({
      where: { id },
    });

    await this.recordAudit(userId, 'call_log.deleted', id);

    return { success: true };
  }

  private normalizeDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid ISO date format: ${value}`);
    }
    return date;
  }

  private normalizeStatus(status: string): CallStatus {
    const upper = status?.toUpperCase().trim() as CallStatus;
    if (!CALL_STATUSES.includes(upper)) {
      throw new BadRequestException(
        `Invalid status '${status}'. Must be one of: ${CALL_STATUSES.join(
          ', ',
        )}`,
      );
    }
    return upper;
  }

  private async recordAudit(userId: string, action: string, targetId: string) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          action,
          entityType: 'CALL_LOG',
          entityId: targetId,
        },
      });
    } catch {
      // Audit log failures should not block transactions
    }
  }
}
