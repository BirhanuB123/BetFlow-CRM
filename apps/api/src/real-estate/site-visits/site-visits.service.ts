import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateSiteVisitInput,
  SITE_VISIT_STATUSES,
  SiteVisitStatus,
  UpdateSiteVisitInput,
} from './site-visits.types';

const siteVisitInclude = {
  lead: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  },
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      account: {
        select: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  },
} as const;

@Injectable()
export class SiteVisitsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: { status?: string; upcoming?: boolean } = {}) {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = this.normalizeStatus(filters.status);
    if (filters.upcoming) where.date = { gte: new Date() };

    const visits = await this.prisma.siteVisit.findMany({
      where,
      include: siteVisitInclude,
      orderBy: { date: 'asc' },
    });

    return Promise.all(
      visits.map(async (visit) => ({
        ...visit,
        recommendedUnits: await this.calculateUnitRecommendations(visit),
      })),
    );
  }

  async get(id: string) {
    const visit = await this.prisma.siteVisit.findFirst({
      where: { id },
      include: siteVisitInclude,
    });

    if (!visit) {
      throw new NotFoundException(`Site visit ${id} was not found`);
    }

    const recommendedUnits = await this.calculateUnitRecommendations(visit);

    return {
      ...visit,
      recommendedUnits,
    };
  }

  async calculateUnitRecommendations(visit: {
    budgetETB?: number | Prisma.Decimal | null;
    preferredSqm?: number | Prisma.Decimal | null;
    bedroomCount?: number | null;
    preferredFloor?: string | null;
    propertyType?: string | null;
  }) {
    const availableUnits = await this.prisma.unit.findMany({
      where: { status: 'AVAILABLE' },
      include: {
        floor: {
          select: {
            id: true,
            floorNumber: true,
            name: true,
            building: {
              select: {
                id: true,
                name: true,
                project: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (availableUnits.length === 0) return [];

    const scored = availableUnits.map((unit) => {
      let score = 0;
      const reasons: string[] = [];

      const unitPrice = Number(unit.price) || 0;
      const unitArea = Number(unit.area) || 0;

      // 1. Budget Match (35 points)
      if (visit.budgetETB && Number(visit.budgetETB) > 0) {
        const budget = Number(visit.budgetETB);
        if (unitPrice <= budget) {
          score += 35;
          reasons.push('Fully within buyer budget');
        } else if (unitPrice <= budget * 1.15) {
          score += 20;
          reasons.push('Within 15% budget range');
        }
      } else {
        score += 20;
      }

      // 2. Preferred Sqm Match (25 points)
      if (
        visit.preferredSqm &&
        Number(visit.preferredSqm) > 0 &&
        unitArea > 0
      ) {
        const targetSqm = Number(visit.preferredSqm);
        const diffRatio = Math.abs(unitArea - targetSqm) / targetSqm;
        if (diffRatio <= 0.15) {
          score += 25;
          reasons.push(`Exact area match (${unitArea}m²)`);
        } else if (diffRatio <= 0.3) {
          score += 15;
          reasons.push(`Close area match (${unitArea}m²)`);
        }
      } else {
        score += 15;
      }

      // 3. Property / Bedroom Type Match (25 points)
      if (visit.propertyType || visit.bedroomCount) {
        const typeLower = unit.type.toLowerCase();
        if (
          visit.propertyType &&
          typeLower.includes(visit.propertyType.toLowerCase().slice(0, 5))
        ) {
          score += 25;
          reasons.push(`Matching property type (${unit.type})`);
        } else if (
          visit.bedroomCount &&
          typeLower.includes(`${visit.bedroomCount}`)
        ) {
          score += 25;
          reasons.push(`${visit.bedroomCount} Bedroom layout match`);
        } else {
          score += 10;
        }
      } else {
        score += 15;
      }

      // 4. Preferred Floor Match (15 points)
      if (visit.preferredFloor) {
        const floorPref = visit.preferredFloor.toLowerCase();
        const flNum = unit.floor.floorNumber;
        if (
          (floorPref.includes('low') && flNum <= 5) ||
          (floorPref.includes('mid') && flNum >= 6 && flNum <= 10) ||
          (floorPref.includes('high') && flNum >= 11) ||
          (floorPref.includes('top') && flNum >= 12)
        ) {
          score += 15;
          reasons.push(`Preferred floor height (Floor ${flNum})`);
        } else {
          score += 5;
        }
      } else {
        score += 10;
      }

      const matchPercentage = Math.min(100, Math.round(score));

      return {
        id: unit.id,
        unitNumber: unit.unitNumber,
        type: unit.type,
        price: unit.price,
        area: unit.area,
        floorNumber: unit.floor.floorNumber,
        buildingName: unit.floor.building.name,
        projectName: unit.floor.building.project.name,
        matchPercentage,
        matchReasons: reasons,
      };
    });

    return scored
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 5);
  }

  async create(userId: string, input: CreateSiteVisitInput) {
    const date = this.normalizeDate(input.date);
    const status = this.normalizeStatus(input.status ?? 'SCHEDULED');

    const leadId = input.leadId || null;
    const customerId = input.customerId || null;
    if (!leadId && !customerId) {
      throw new BadRequestException(
        'A site visit must reference a lead or a customer',
      );
    }
    if (leadId) await this.assertLeadExists(leadId);
    if (customerId) await this.assertCustomerExists(customerId);

    const visit = await this.prisma.siteVisit.create({
      data: {
        date,
        status,
        notes: input.notes?.trim() || null,
        leadId,
        customerId,
        preferredSqm: input.preferredSqm ? Number(input.preferredSqm) : null,
        bedroomCount: input.bedroomCount ? Number(input.bedroomCount) : null,
        preferredFloor: input.preferredFloor?.trim() || null,
        facingDirection: input.facingDirection?.trim() || null,
        propertyType: input.propertyType?.trim() || null,
        purpose: input.purpose?.trim() || null,
        budgetETB: input.budgetETB ? Number(input.budgetETB) : null,
        paymentMethod: input.paymentMethod?.trim() || null,
        demands: input.demands?.trim() || null,
      },
      include: siteVisitInclude,
    });

    await this.recordAudit(userId, 'site_visit.created', visit.id);

    return visit;
  }

  async update(userId: string, id: string, input: UpdateSiteVisitInput) {
    const existing = await this.prisma.siteVisit.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Site visit ${id} was not found`);
    }

    if (input.leadId) await this.assertLeadExists(input.leadId);
    if (input.customerId) await this.assertCustomerExists(input.customerId);

    const data: Record<string, unknown> = {};
    if (input.date !== undefined) data.date = this.normalizeDate(input.date);
    if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
    if (input.leadId !== undefined) data.leadId = input.leadId || null;
    if (input.customerId !== undefined)
      data.customerId = input.customerId || null;
    if (input.preferredSqm !== undefined)
      data.preferredSqm = input.preferredSqm
        ? Number(input.preferredSqm)
        : null;
    if (input.bedroomCount !== undefined)
      data.bedroomCount = input.bedroomCount
        ? Number(input.bedroomCount)
        : null;
    if (input.preferredFloor !== undefined)
      data.preferredFloor = input.preferredFloor?.trim() || null;
    if (input.facingDirection !== undefined)
      data.facingDirection = input.facingDirection?.trim() || null;
    if (input.propertyType !== undefined)
      data.propertyType = input.propertyType?.trim() || null;
    if (input.purpose !== undefined)
      data.purpose = input.purpose?.trim() || null;
    if (input.budgetETB !== undefined)
      data.budgetETB = input.budgetETB ? Number(input.budgetETB) : null;
    if (input.paymentMethod !== undefined)
      data.paymentMethod = input.paymentMethod?.trim() || null;
    if (input.demands !== undefined)
      data.demands = input.demands?.trim() || null;

    const visit = await this.prisma.siteVisit.update({
      where: { id },
      data,
      include: siteVisitInclude,
    });

    await this.recordAudit(userId, 'site_visit.updated', visit.id);

    return visit;
  }

  async updateStatus(userId: string, id: string, status: string) {
    const normalized = this.normalizeStatus(status);
    const existing = await this.prisma.siteVisit.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Site visit ${id} was not found`);
    }

    const visit = await this.prisma.siteVisit.update({
      where: { id },
      data: { status: normalized },
      include: siteVisitInclude,
    });

    // Auto-schedule a 48-hour follow-up call reminder when a site visit is marked COMPLETED
    if (normalized === 'COMPLETED') {
      try {
        const dueDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
        await this.prisma.callLog.create({
          data: {
            subject: `Post-Visit Follow-Up: Review Property Specs & Send Pro-Forma`,
            callType: 'OUTBOUND',
            callPurpose: 'POST_VISIT_FOLLOWUP',
            dueDate,
            status: 'PENDING',
            leadId: visit.leadId,
            customerId: visit.customerId,
            notes: `Auto-generated follow-up reminder 48 hours after site visit completed on ${new Date().toLocaleDateString()}.`,
          },
        });
      } catch {
        // Non-blocking background trigger
      }
    }

    await this.recordAudit(userId, 'site_visit.status_changed', visit.id, {
      from: existing.status,
      to: normalized,
    });

    return visit;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.siteVisit.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Site visit ${id} was not found`);
    }

    await this.prisma.siteVisit.delete({ where: { id } });
    await this.recordAudit(userId, 'site_visit.deleted', id);

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

  private async assertLeadExists(leadId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId },
    });
    if (!lead) {
      throw new BadRequestException(`Lead ${leadId} was not found`);
    }
  }

  private async assertCustomerExists(customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId },
    });
    if (!customer) {
      throw new BadRequestException(`Customer ${customerId} was not found`);
    }
  }

  private recordAudit(
    userId: string,
    action: string,
    entityId: string,
    newValues?: Record<string, string>,
  ) {
    return this.prisma.auditLog.create({
      data: { userId, action, entityType: 'SiteVisit', entityId, newValues },
    });
  }
}
