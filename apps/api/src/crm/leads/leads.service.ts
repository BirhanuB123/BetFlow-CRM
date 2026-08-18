import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  classifyLeadOrigin,
  getTransliteratedVariants,
  normalizePhone,
} from '@betflow/shared';
import { PrismaService } from '../../database/prisma.service';
import {
  ConvertLeadInput,
  CreateLeadInput,
  LEAD_STATUSES,
  LeadStatus,
  UpdateLeadInput,
} from './leads.types';

import { AiScoringService } from './ai-scoring.service';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import { assertEntityOwnership } from '../../common/utils/ownership.util';

const leadInclude = {
  source: { select: { id: true, name: true } },
  owner: { select: { id: true, firstName: true, lastName: true } },
} as const;

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiScoring: AiScoringService,
  ) {}

  async list(search?: string) {
    const where: Prisma.LeadWhereInput = {};

    if (search?.trim()) {
      const variants = getTransliteratedVariants(search);
      where.OR = variants.flatMap((term) => [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { company: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ]);
    }

    const leads = await this.prisma.lead.findMany({
      where,
      include: leadInclude,
      orderBy: { createdAt: 'desc' },
    });

    return leads.map((lead) => ({
      ...lead,
      diasporaTag: classifyLeadOrigin(lead.phone),
      aiScore: this.aiScoring.scoreLead({
        id: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        sourceName: lead.source?.name,
        createdAt: lead.createdAt,
      }),
    }));
  }

  listSources() {
    return this.prisma.leadSource.findMany({
      where: {},
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(userId: string, input: CreateLeadInput) {
    const firstName = input.firstName?.trim();
    const lastName = input.lastName?.trim();

    if (!firstName || !lastName) {
      throw new BadRequestException('firstName and lastName are required');
    }

    const status = this.normalizeStatus(input.status ?? 'NEW');
    const normalizedPhone = normalizePhone(input.phone);
    const email = input.email?.trim()?.toLowerCase() || null;

    // Deduplication check by Phone
    if (normalizedPhone) {
      const existingLead = await this.prisma.lead.findFirst({
        where: {
          OR: [
            { phone: normalizedPhone },
            { phone: input.phone?.trim() },
          ],
        },
        include: { owner: { select: { firstName: true, lastName: true } } },
      });

      if (existingLead) {
        const ownerName = existingLead.owner
          ? `${existingLead.owner.firstName} ${existingLead.owner.lastName}`
          : 'Unassigned';
        throw new BadRequestException(
          `Duplicate lead detected: A lead with phone ${normalizedPhone} already exists (${existingLead.firstName} ${existingLead.lastName}, Status: ${existingLead.status}, Owner: ${ownerName}).`,
        );
      }

      const existingCustomer = await this.prisma.customer.findFirst({
        where: {
          OR: [
            { phone: normalizedPhone },
            { phone: input.phone?.trim() },
          ],
        },
      });

      if (existingCustomer) {
        throw new BadRequestException(
          `Duplicate entry: Customer with phone ${normalizedPhone} already exists (${existingCustomer.firstName} ${existingCustomer.lastName}).`,
        );
      }
    }

    // Deduplication check by Email
    if (email) {
      const existingEmailLead = await this.prisma.lead.findFirst({
        where: { email },
      });
      if (existingEmailLead) {
        throw new BadRequestException(
          `Duplicate lead detected: A lead with email ${email} already exists (${existingEmailLead.firstName} ${existingEmailLead.lastName}).`,
        );
      }
    }

    if (input.sourceId) {
      await this.assertSourceExists(input.sourceId);
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const lead = await tx.lead.create({
        data: {
          firstName,
          lastName,
          company: input.company?.trim() || null,
          email,
          phone: normalizedPhone || input.phone?.trim() || null,
          status,
          sourceId: input.sourceId || null,
          ownerId: input.ownerId || userId,
        },
        include: leadInclude,
      });

      const diasporaTag = classifyLeadOrigin(lead.phone);

      // Smart Automation: Calculate AI Score & Trigger Auto-Tasks
      const aiScore = this.aiScoring.scoreLead({
        id: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        sourceName: lead.source?.name,
        createdAt: lead.createdAt,
      });

      if (aiScore.score >= 75) {
        // Auto-create urgent follow-up task
        await tx.task.create({
          data: {
            title: `🔥 AI Auto-Task: Immediate VIP outreach for ${lead.firstName} ${lead.lastName}`,
            description: `${aiScore.suggestedNextAction} (${diasporaTag.isDiaspora ? `Diaspora Lead - ${diasporaTag.originCountry}` : 'Local Lead'})`,
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Due in 24h
            status: 'TODO',
            assigneeId: lead.ownerId ?? userId,
            entityType: 'Lead',
            entityId: lead.id,
          },
        });

        // Auto-create in-app notification
        await tx.notification.create({
          data: {
            userId: lead.ownerId ?? userId,
            title: `🔥 High-Intent Lead Alert (${aiScore.score}/100)`,
            message: `Lead ${lead.firstName} ${lead.lastName} scored ${aiScore.score}/100. Origin: ${diasporaTag.flag} ${diasporaTag.originCountry}. Action required: ${aiScore.suggestedNextAction}`,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: 'lead.created',
          entityType: 'Lead',
          entityId: lead.id,
          newValues: {
            phone: normalizedPhone,
            isDiaspora: String(diasporaTag.isDiaspora),
            originCountry: diasporaTag.originCountry,
          },
        },
      });

      return {
        ...lead,
        diasporaTag,
        aiScore,
      };
    });
  }

  async update(
    user: AuthenticatedUser | string,
    id: string,
    input: UpdateLeadInput,
  ) {
    const userId = typeof user === 'string' ? user : user.id;
    const existing = await this.prisma.lead.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Lead ${id} was not found`);
    }

    assertEntityOwnership(user, existing.ownerId, 'lead');

    if (input.sourceId) {
      await this.assertSourceExists(input.sourceId);
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

    await this.recordAudit(userId, 'lead.updated', lead.id);

    return lead;
  }

  async remove(user: AuthenticatedUser | string, id: string) {
    const userId = typeof user === 'string' ? user : user.id;
    const existing = await this.prisma.lead.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Lead ${id} was not found`);
    }

    assertEntityOwnership(user, existing.ownerId, 'lead');

    await this.prisma.lead.delete({ where: { id } });
    await this.recordAudit(userId, 'lead.deleted', id);

    return { id, deleted: true };
  }

  async updateStatus(
    user: AuthenticatedUser | string,
    id: string,
    status: string,
  ) {
    const userId = typeof user === 'string' ? user : user.id;
    const normalized = this.normalizeStatus(status);
    const existing = await this.prisma.lead.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Lead ${id} was not found`);
    }

    assertEntityOwnership(user, existing.ownerId, 'lead');

    const lead = await this.prisma.lead.update({
      where: { id },
      data: { status: normalized },
      include: leadInclude,
    });

    await this.recordAudit(userId, 'lead.status_changed', lead.id, {
      from: existing.status,
      to: normalized,
    });

    return lead;
  }

  async convert(
    user: AuthenticatedUser | string,
    id: string,
    input: ConvertLeadInput,
  ) {
    const userId = typeof user === 'string' ? user : user.id;
    const lead = await this.prisma.lead.findFirst({ where: { id } });
    if (!lead) throw new NotFoundException(`Lead ${id} was not found`);
    assertEntityOwnership(user, lead.ownerId, 'lead');
    if (lead.convertedAt) {
      throw new BadRequestException('Lead has already been converted');
    }

    // Validate the optional deal + account up front (outside the transaction).
    let dealValue: string | undefined;
    if (input.deal) {
      if (!input.deal.name?.trim())
        throw new BadRequestException('deal.name is required');
      if (!input.deal.stageId)
        throw new BadRequestException('deal.stageId is required');
      const stage = await this.prisma.dealStage.findFirst({
        where: { id: input.deal.stageId },
      });
      if (!stage)
        throw new BadRequestException(
          `Deal stage ${input.deal.stageId} was not found`,
        );
      const parsed = Number(input.deal.value);
      if (Number.isNaN(parsed) || parsed < 0)
        throw new BadRequestException(
          'deal.value must be a non-negative number',
        );
      dealValue = parsed.toFixed(2);
    }

    if (input.accountId) {
      const account = await this.prisma.account.findFirst({
        where: { id: input.accountId },
        select: { id: true },
      });
      if (!account)
        throw new BadRequestException(
          `Account ${input.accountId} was not found`,
        );
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const currentLead = await tx.lead.findUnique({ where: { id } });
      if (!currentLead) throw new NotFoundException(`Lead ${id} was not found`);
      if (currentLead.convertedAt) {
        throw new BadRequestException('Lead has already been converted');
      }

      // 1. Resolve or create the account.
      let account: { id: string; name: string } | null = null;
      if (input.accountId) {
        account = await tx.account.findUnique({
          where: { id: input.accountId },
          select: { id: true, name: true },
        });
      } else if (input.createAccount) {
        const name =
          lead.company?.trim() || `${lead.firstName} ${lead.lastName}`.trim();
        account = await tx.account.create({
          data: {
            name,
            accountType: 'CUSTOMER',
            ownerId: lead.ownerId ?? userId,
          },
          select: { id: true, name: true },
        });
        await tx.auditLog.create({
          data: {
            userId,
            action: 'account.created',
            entityType: 'Account',
            entityId: account.id,
          },
        });
      }
      const accountId = account?.id ?? null;

      // 2. Create the contact (Customer) from the lead.
      const customer = await tx.customer.create({
        data: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          accountId,
        },
        select: { id: true, firstName: true, lastName: true },
      });
      await tx.auditLog.create({
        data: {
          userId,
          action: 'customer.created',
          entityType: 'Customer',
          entityId: customer.id,
        },
      });

      // 3. Optionally open a deal.
      let deal: { id: string; name: string } | null = null;
      if (input.deal && dealValue) {
        deal = await tx.deal.create({
          data: {
            name: input.deal.name.trim(),
            value: dealValue,
            stageId: input.deal.stageId,
            customerId: customer.id,
            accountId,
          },
          select: { id: true, name: true },
        });
        await tx.auditLog.create({
          data: {
            userId,
            action: 'deal.created',
            entityType: 'Deal',
            entityId: deal.id,
          },
        });
      }

      // 4. Migrate all pre-conversion historical interactions and records to the new Customer
      await tx.siteVisit.updateMany({
        where: { leadId: id },
        data: { customerId: customer.id },
      });

      await tx.meeting.updateMany({
        where: { leadId: id },
        data: { customerId: customer.id },
      });

      await tx.callLog.updateMany({
        where: { leadId: id },
        data: { customerId: customer.id },
      });

      await tx.note.updateMany({
        where: { entityType: 'Lead', entityId: id },
        data: { entityType: 'Customer', entityId: customer.id },
      });

      await tx.task.updateMany({
        where: { entityType: 'Lead', entityId: id },
        data: { entityType: 'Customer', entityId: customer.id },
      });

      await tx.document.updateMany({
        where: { entityType: 'Lead', entityId: id },
        data: { entityType: 'Customer', entityId: customer.id },
      });

      await tx.activity.updateMany({
        where: { entityType: 'Lead', entityId: id },
        data: { entityType: 'Customer', entityId: customer.id },
      });

      // 5. Mark the lead converted and link it to the new contact.
      const updatedLead = await tx.lead.update({
        where: { id },
        data: {
          status: 'CONVERTED',
          convertedAt: new Date(),
          convertedCustomerId: customer.id,
        },
        include: leadInclude,
      });

      await tx.notification.create({
        data: {
          userId,
          title: 'Lead Converted',
          message: `Lead ${lead.firstName} ${lead.lastName} has been successfully converted to a Customer.`,
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'lead.converted',
          entityType: 'Lead',
          entityId: id,
          newValues: {
            customerId: customer.id,
            ...(accountId ? { accountId } : {}),
            ...(deal ? { dealId: deal.id } : {}),
          },
        },
      });

      return { lead: updatedLead, customer, account, deal };
    });
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

  private async assertSourceExists(sourceId: string) {
    const source = await this.prisma.leadSource.findFirst({
      where: { id: sourceId },
    });

    if (!source) {
      throw new BadRequestException(`Lead source ${sourceId} was not found`);
    }
  }

  private recordAudit(
    userId: string,
    action: string,
    entityId: string,
    newValues?: Record<string, string>,
  ) {
    return this.prisma.auditLog.create({
      data: { userId, action, entityType: 'Lead', entityId, newValues },
    });
  }
}
