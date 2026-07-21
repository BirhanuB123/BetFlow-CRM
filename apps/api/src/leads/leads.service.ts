import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  ConvertLeadInput,
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

  list() {
    return this.prisma.lead.findMany({
      where: {},
      include: leadInclude,
      orderBy: { createdAt: 'desc' },
    });
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

    if (input.sourceId) {
      await this.assertSourceBelongsToTenant(input.sourceId);
    }

    const lead = await this.prisma.lead.create({
      data: {
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

    await this.recordAudit(userId, 'lead.created', lead.id);

    return lead;
  }

  async update(userId: string, id: string, input: UpdateLeadInput) {
    const existing = await this.prisma.lead.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Lead ${id} was not found`);
    }

    if (input.sourceId) {
      await this.assertSourceBelongsToTenant(input.sourceId);
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

  async remove(userId: string, id: string) {
    const existing = await this.prisma.lead.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Lead ${id} was not found`);
    }

    await this.prisma.lead.delete({ where: { id } });
    await this.recordAudit(userId, 'lead.deleted', id);

    return { id, deleted: true };
  }

  async updateStatus(userId: string, id: string, status: string) {
    const normalized = this.normalizeStatus(status);
    const existing = await this.prisma.lead.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Lead ${id} was not found`);
    }

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

  async convert(userId: string, id: string, input: ConvertLeadInput) {
    const lead = await this.prisma.lead.findFirst({ where: { id } });
    if (!lead) throw new NotFoundException(`Lead ${id} was not found`);
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

      // 4. Mark the lead converted and link it to the new contact.
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

  private async assertSourceBelongsToTenant(sourceId: string) {
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
