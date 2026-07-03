import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateLeadInput,
  LEAD_STATUSES,
  LeadStatus,
  UpdateLeadInput,
} from './leads.types';

const leadInclude = {
  source: { select: { id: true, name: true } },
  owner: { select: { id: true, firstName: true, lastName: true } },
} as const;

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.lead.findMany({
      where: { tenantId },
      include: leadInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  listSources(tenantId: string) {
    return this.prisma.leadSource.findMany({
      where: { tenantId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(tenantId: string, userId: string, input: CreateLeadInput) {
    const firstName = input.firstName?.trim();
    const lastName = input.lastName?.trim();

    if (!firstName || !lastName) {
      throw new BadRequestException('firstName and lastName are required');
    }

    const status = this.normalizeStatus(input.status ?? 'NEW');

    if (input.sourceId) {
      await this.assertSourceBelongsToTenant(tenantId, input.sourceId);
    }

    const lead = await this.prisma.lead.create({
      data: {
        tenantId,
        firstName,
        lastName,
        company: input.company?.trim() || null,
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        status,
        sourceId: input.sourceId || null,
        ownerId: input.ownerId || userId,
      },
      include: leadInclude,
    });

    await this.recordAudit(tenantId, userId, 'lead.created', lead.id);

    return lead;
  }

  async update(
    tenantId: string,
    userId: string,
    id: string,
    input: UpdateLeadInput,
  ) {
    const existing = await this.prisma.lead.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Lead ${id} was not found`);
    }

    if (input.sourceId) {
      await this.assertSourceBelongsToTenant(tenantId, input.sourceId);
    }

    const data: Record<string, unknown> = {};
    if (input.firstName !== undefined) data.firstName = input.firstName.trim();
    if (input.lastName !== undefined) data.lastName = input.lastName.trim();
    if (input.company !== undefined)
      data.company = input.company?.trim() || null;
    if (input.email !== undefined) data.email = input.email?.trim() || null;
    if (input.phone !== undefined) data.phone = input.phone?.trim() || null;
    if (input.status !== undefined)
      data.status = this.normalizeStatus(input.status);
    if (input.sourceId !== undefined) data.sourceId = input.sourceId || null;
    if (input.ownerId !== undefined) data.ownerId = input.ownerId || null;

    const lead = await this.prisma.lead.update({
      where: { id },
      data,
      include: leadInclude,
    });

    await this.recordAudit(tenantId, userId, 'lead.updated', lead.id);

    return lead;
  }

  async remove(tenantId: string, userId: string, id: string) {
    const existing = await this.prisma.lead.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Lead ${id} was not found`);
    }

    await this.prisma.lead.delete({ where: { id } });
    await this.recordAudit(tenantId, userId, 'lead.deleted', id);

    return { id, deleted: true };
  }

  async updateStatus(
    tenantId: string,
    userId: string,
    id: string,
    status: string,
  ) {
    const normalized = this.normalizeStatus(status);
    const existing = await this.prisma.lead.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Lead ${id} was not found`);
    }

    const lead = await this.prisma.lead.update({
      where: { id },
      data: { status: normalized },
      include: leadInclude,
    });

    await this.recordAudit(tenantId, userId, 'lead.status_changed', lead.id, {
      from: existing.status,
      to: normalized,
    });

    return lead;
  }

  private normalizeStatus(status: string): LeadStatus {
    const upper = status?.trim().toUpperCase();

    if (!LEAD_STATUSES.includes(upper as LeadStatus)) {
      throw new BadRequestException(
        `status must be one of: ${LEAD_STATUSES.join(', ')}`,
      );
    }

    return upper as LeadStatus;
  }

  private async assertSourceBelongsToTenant(
    tenantId: string,
    sourceId: string,
  ) {
    const source = await this.prisma.leadSource.findFirst({
      where: { id: sourceId, tenantId },
    });

    if (!source) {
      throw new BadRequestException(`Lead source ${sourceId} was not found`);
    }
  }

  private recordAudit(
    tenantId: string,
    userId: string,
    action: string,
    entityId: string,
    newValues?: Record<string, string>,
  ) {
    return this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entityType: 'Lead',
        entityId,
        newValues,
      },
    });
  }
}
