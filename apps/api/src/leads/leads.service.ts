import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateLeadInput, LEAD_STATUSES, LeadStatus } from './leads.types';

const leadInclude = {
  source: { select: { id: true, name: true } },
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
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        status,
        sourceId: input.sourceId || null,
      },
      include: leadInclude,
    });

    await this.recordAudit(tenantId, userId, 'lead.created', lead.id);

    return lead;
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
