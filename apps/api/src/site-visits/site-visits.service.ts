import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateSiteVisitInput,
  SITE_VISIT_STATUSES,
  SiteVisitStatus,
  UpdateSiteVisitInput,
} from './site-visits.types';

const siteVisitInclude = {
  lead: { select: { id: true, firstName: true, lastName: true } },
  customer: { select: { id: true, firstName: true, lastName: true } },
} as const;

@Injectable()
export class SiteVisitsService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string, filters: { status?: string; upcoming?: boolean } = {}) {
    const where: Record<string, unknown> = { tenantId };
    if (filters.status) where.status = this.normalizeStatus(filters.status);
    if (filters.upcoming) where.date = { gte: new Date() };

    return this.prisma.siteVisit.findMany({
      where,
      include: siteVisitInclude,
      orderBy: { date: 'asc' },
    });
  }

  async get(tenantId: string, id: string) {
    const visit = await this.prisma.siteVisit.findFirst({
      where: { id, tenantId },
      include: siteVisitInclude,
    });

    if (!visit) {
      throw new NotFoundException(`Site visit ${id} was not found`);
    }

    return visit;
  }

  async create(tenantId: string, userId: string, input: CreateSiteVisitInput) {
    const date = this.normalizeDate(input.date);
    const status = this.normalizeStatus(input.status ?? 'SCHEDULED');

    const leadId = input.leadId || null;
    const customerId = input.customerId || null;
    if (!leadId && !customerId) {
      throw new BadRequestException(
        'A site visit must reference a lead or a customer',
      );
    }
    if (leadId) await this.assertLeadBelongsToTenant(tenantId, leadId);
    if (customerId)
      await this.assertCustomerBelongsToTenant(tenantId, customerId);

    const visit = await this.prisma.siteVisit.create({
      data: {
        tenantId,
        date,
        status,
        notes: input.notes?.trim() || null,
        leadId,
        customerId,
      },
      include: siteVisitInclude,
    });

    await this.recordAudit(tenantId, userId, 'site_visit.created', visit.id);

    return visit;
  }

  async update(
    tenantId: string,
    userId: string,
    id: string,
    input: UpdateSiteVisitInput,
  ) {
    const existing = await this.prisma.siteVisit.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Site visit ${id} was not found`);
    }

    if (input.leadId) await this.assertLeadBelongsToTenant(tenantId, input.leadId);
    if (input.customerId)
      await this.assertCustomerBelongsToTenant(tenantId, input.customerId);

    const data: Record<string, unknown> = {};
    if (input.date !== undefined) data.date = this.normalizeDate(input.date);
    if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
    if (input.leadId !== undefined) data.leadId = input.leadId || null;
    if (input.customerId !== undefined)
      data.customerId = input.customerId || null;

    const visit = await this.prisma.siteVisit.update({
      where: { id },
      data,
      include: siteVisitInclude,
    });

    await this.recordAudit(tenantId, userId, 'site_visit.updated', visit.id);

    return visit;
  }

  async updateStatus(
    tenantId: string,
    userId: string,
    id: string,
    status: string,
  ) {
    const normalized = this.normalizeStatus(status);
    const existing = await this.prisma.siteVisit.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Site visit ${id} was not found`);
    }

    const visit = await this.prisma.siteVisit.update({
      where: { id },
      data: { status: normalized },
      include: siteVisitInclude,
    });

    await this.recordAudit(
      tenantId,
      userId,
      'site_visit.status_changed',
      visit.id,
      { from: existing.status, to: normalized },
    );

    return visit;
  }

  async remove(tenantId: string, userId: string, id: string) {
    const existing = await this.prisma.siteVisit.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Site visit ${id} was not found`);
    }

    await this.prisma.siteVisit.delete({ where: { id } });
    await this.recordAudit(tenantId, userId, 'site_visit.deleted', id);

    return { id, deleted: true };
  }

  private normalizeStatus(status: string): SiteVisitStatus {
    const upper = status?.trim().toUpperCase().replace(/\s+/g, '_');

    if (!SITE_VISIT_STATUSES.includes(upper as SiteVisitStatus)) {
      throw new BadRequestException(
        `status must be one of: ${SITE_VISIT_STATUSES.join(', ')}`,
      );
    }

    return upper as SiteVisitStatus;
  }

  private normalizeDate(value: string): Date {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) {
      throw new BadRequestException('date must be a valid date');
    }
    return date;
  }

  private async assertLeadBelongsToTenant(tenantId: string, leadId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, tenantId },
    });
    if (!lead) {
      throw new BadRequestException(`Lead ${leadId} was not found`);
    }
  }

  private async assertCustomerBelongsToTenant(
    tenantId: string,
    customerId: string,
  ) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, tenantId },
    });
    if (!customer) {
      throw new BadRequestException(`Customer ${customerId} was not found`);
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
        entityType: 'SiteVisit',
        entityId,
        newValues,
      },
    });
  }
}
