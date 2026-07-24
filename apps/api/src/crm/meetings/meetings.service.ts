import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateMeetingInput,
  MEETING_STATUSES,
  MeetingStatus,
  UpdateMeetingInput,
} from './meetings.types';

const meetingInclude = {
  lead: { select: { id: true, firstName: true, lastName: true } },
  customer: { select: { id: true, firstName: true, lastName: true } },
} as const;

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  list(filters: { status?: string; upcoming?: boolean } = {}) {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = this.normalizeStatus(filters.status);
    if (filters.upcoming) where.date = { gte: new Date() };

    return this.prisma.meeting.findMany({
      where,
      include: meetingInclude,
      orderBy: { date: 'asc' },
    });
  }

  async get(id: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: { id },
      include: meetingInclude,
    });

    if (!meeting) {
      throw new NotFoundException(`Meeting ${id} was not found`);
    }

    return meeting;
  }

  async create(userId: string, input: CreateMeetingInput) {
    const date = this.normalizeDate(input.date);
    const title = input.title?.trim();
    if (!title) {
      throw new BadRequestException('Meeting title is required');
    }

    const leadId = input.leadId || null;
    const customerId = input.customerId || null;
    if (!leadId && !customerId) {
      throw new BadRequestException(
        'A meeting must reference a lead or a customer',
      );
    }

    const meeting = await this.prisma.meeting.create({
      data: {
        title,
        meetingType: input.meetingType || 'IN_PERSON_OFFICE',
        date,
        durationMinutes: input.durationMinutes
          ? Number(input.durationMinutes)
          : 30,
        location: input.location?.trim() || null,
        agenda: input.agenda?.trim() || null,
        notes: input.notes?.trim() || null,
        status: 'SCHEDULED',
        leadId,
        customerId,
      },
      include: meetingInclude,
    });

    await this.recordAudit(userId, 'meeting.created', meeting.id);

    return meeting;
  }

  async update(userId: string, id: string, input: UpdateMeetingInput) {
    const existing = await this.prisma.meeting.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Meeting ${id} was not found`);
    }

    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title.trim();
    if (input.meetingType !== undefined) data.meetingType = input.meetingType;
    if (input.date !== undefined) data.date = this.normalizeDate(input.date);
    if (input.durationMinutes !== undefined)
      data.durationMinutes = Number(input.durationMinutes);
    if (input.location !== undefined)
      data.location = input.location?.trim() || null;
    if (input.agenda !== undefined) data.agenda = input.agenda?.trim() || null;
    if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
    if (input.leadId !== undefined) data.leadId = input.leadId || null;
    if (input.customerId !== undefined)
      data.customerId = input.customerId || null;

    const meeting = await this.prisma.meeting.update({
      where: { id },
      data,
      include: meetingInclude,
    });

    await this.recordAudit(userId, 'meeting.updated', meeting.id);

    return meeting;
  }

  async updateStatus(userId: string, id: string, status: string) {
    const normalized = this.normalizeStatus(status);
    const existing = await this.prisma.meeting.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Meeting ${id} was not found`);
    }

    const meeting = await this.prisma.meeting.update({
      where: { id },
      data: { status: normalized },
      include: meetingInclude,
    });

    await this.recordAudit(userId, 'meeting.status_changed', meeting.id);

    return meeting;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.meeting.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Meeting ${id} was not found`);
    }

    await this.prisma.meeting.delete({
      where: { id },
    });

    await this.recordAudit(userId, 'meeting.deleted', id);

    return { success: true };
  }

  private normalizeDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid ISO date format: ${value}`);
    }
    return date;
  }

  private normalizeStatus(status: string): MeetingStatus {
    const upper = status?.toUpperCase().trim() as MeetingStatus;
    if (!MEETING_STATUSES.includes(upper)) {
      throw new BadRequestException(
        `Invalid status '${status}'. Must be one of: ${MEETING_STATUSES.join(
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
          entityType: 'MEETING',
          entityId: targetId,
        },
      });
    } catch {
      // Audit log failures should not block transactions
    }
  }
}
