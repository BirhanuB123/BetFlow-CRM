import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisCacheService } from '../../database/redis-cache.service';
import { CallsGateway } from './calls.gateway';

const callInclude = {
  lead: { select: { id: true, firstName: true, lastName: true, phone: true } },
  customer: {
    select: { id: true, firstName: true, lastName: true, phone: true },
  },
} as const;

@Injectable()
export class CallsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisCache: RedisCacheService,
    private readonly callsGateway: CallsGateway,
  ) {}

  async list(
    filters: {
      status?: string;
      callType?: string;
      leadId?: string;
      customerId?: string;
    } = {},
  ) {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status.toUpperCase();
    if (filters.callType) where.callType = filters.callType.toUpperCase();
    if (filters.leadId) where.leadId = filters.leadId;
    if (filters.customerId) where.customerId = filters.customerId;

    const calls = await this.prisma.callLog.findMany({
      where,
      include: callInclude,
      orderBy: { dueDate: 'desc' },
    });

    return calls.map((c) => ({
      ...c,
      leadName: c.lead ? `${c.lead.firstName} ${c.lead.lastName}`.trim() : null,
      customerName: c.customer
        ? `${c.customer.firstName} ${c.customer.lastName}`.trim()
        : null,
    }));
  }

  async get(id: string) {
    const call = await this.prisma.callLog.findFirst({
      where: { id },
      include: callInclude,
    });

    if (!call) {
      throw new NotFoundException(`Call Log ${id} was not found`);
    }

    return {
      ...call,
      leadName: call.lead
        ? `${call.lead.firstName} ${call.lead.lastName}`.trim()
        : null,
      customerName: call.customer
        ? `${call.customer.firstName} ${call.customer.lastName}`.trim()
        : null,
    };
  }

  async create(userId: string, input: any) {
    const subject = input.subject?.trim();
    if (!subject) throw new BadRequestException('subject is required');

    const dueDate = input.dueDate ? new Date(input.dueDate) : new Date();

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
        status: input.status || 'PENDING',
        leadId: input.leadId || null,
        customerId: input.customerId || null,
      },
      include: callInclude,
    });

    const result = {
      ...call,
      leadName: call.lead
        ? `${call.lead.firstName} ${call.lead.lastName}`.trim()
        : null,
      customerName: call.customer
        ? `${call.customer.firstName} ${call.customer.lastName}`.trim()
        : null,
    };

    await this.recordAudit(userId, 'call.created', call.id);
    await this.redisCache.invalidatePattern('calls:');
    this.callsGateway.broadcastCallEvent('created', result);

    return result;
  }

  async update(userId: string, id: string, input: any) {
    const existing = await this.prisma.callLog.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`Call Log ${id} was not found`);

    const data: Record<string, unknown> = {};
    if (input.subject !== undefined) data.subject = input.subject.trim();
    if (input.callType !== undefined) data.callType = input.callType;
    if (input.callPurpose !== undefined) data.callPurpose = input.callPurpose;
    if (input.callResult !== undefined) data.callResult = input.callResult;
    if (input.dueDate !== undefined) data.dueDate = new Date(input.dueDate);
    if (input.durationSeconds !== undefined)
      data.durationSeconds = Number(input.durationSeconds);
    if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
    if (input.status !== undefined) data.status = input.status;
    if (input.leadId !== undefined) data.leadId = input.leadId || null;
    if (input.customerId !== undefined)
      data.customerId = input.customerId || null;

    const call = await this.prisma.callLog.update({
      where: { id },
      data,
      include: callInclude,
    });

    const result = {
      ...call,
      leadName: call.lead
        ? `${call.lead.firstName} ${call.lead.lastName}`.trim()
        : null,
      customerName: call.customer
        ? `${call.customer.firstName} ${call.customer.lastName}`.trim()
        : null,
    };

    await this.recordAudit(userId, 'call.updated', id);
    await this.redisCache.invalidatePattern('calls:');
    this.callsGateway.broadcastCallEvent('updated', result);

    return result;
  }

  async completeCall(
    userId: string,
    id: string,
    input: { durationSeconds?: number; callResult?: string; notes?: string },
  ) {
    const existing = await this.prisma.callLog.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`Call Log ${id} was not found`);

    const call = await this.prisma.callLog.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        callResult: input.callResult || existing.callResult || 'INTERESTED',
        durationSeconds: input.durationSeconds
          ? Number(input.durationSeconds)
          : existing.durationSeconds || 120,
        notes: input.notes ? input.notes.trim() : existing.notes,
      },
      include: callInclude,
    });

    const result = {
      ...call,
      leadName: call.lead
        ? `${call.lead.firstName} ${call.lead.lastName}`.trim()
        : null,
      customerName: call.customer
        ? `${call.customer.firstName} ${call.customer.lastName}`.trim()
        : null,
    };

    await this.recordAudit(userId, 'call.completed', id);
    await this.redisCache.invalidatePattern('calls:');
    this.callsGateway.broadcastCallEvent('completed', result);

    return result;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.callLog.findFirst({ where: { id } });
    if (!existing) throw new NotFoundException(`Call Log ${id} was not found`);

    await this.prisma.callLog.delete({ where: { id } });
    await this.recordAudit(userId, 'call.deleted', id);
    await this.redisCache.invalidatePattern('calls:');
    this.callsGateway.broadcastCallEvent('deleted', { id });

    return { id, deleted: true };
  }

  async getStats() {
    const totalCalls = await this.prisma.callLog.count();
    const completed = await this.prisma.callLog.count({
      where: { status: 'COMPLETED' },
    });
    const pending = await this.prisma.callLog.count({
      where: { status: 'PENDING' },
    });
    const overdue = await this.prisma.callLog.count({
      where: { status: 'PENDING', dueDate: { lt: new Date() } },
    });

    const interestedCount = await this.prisma.callLog.count({
      where: { callResult: 'INTERESTED' },
    });
    const noAnswerCount = await this.prisma.callLog.count({
      where: { callResult: 'NO_ANSWER' },
    });
    const busyCount = await this.prisma.callLog.count({
      where: { callResult: 'BUSY_CALL_BACK' },
    });
    const proformaCount = await this.prisma.callLog.count({
      where: { callResult: 'REQUESTED_PROFORMA' },
    });

    return {
      totalCalls,
      completed,
      pending,
      overdue,
      outcomes: {
        interestedCount,
        noAnswerCount,
        busyCount,
        proformaCount,
      },
    };
  }

  private recordAudit(userId: string, action: string, entityId: string) {
    return this.prisma.auditLog.create({
      data: { userId, action, entityType: 'CallLog', entityId },
    });
  }
}
