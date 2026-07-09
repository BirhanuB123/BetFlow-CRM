import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateDealInput,
  UpdateDealInput,
} from './deals.types';

const dealInclude = {
  stage: { select: { id: true, name: true, order: true, probability: true } },
  customer: { select: { id: true, firstName: true, lastName: true } },
  account: { select: { id: true, name: true } },
  unit: { select: { id: true, unitNumber: true, type: true } },
} as const;

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.deal.findMany({
      where: { tenantId },
      include: dealInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  listStages(tenantId: string) {
    return this.prisma.dealStage.findMany({
      where: { tenantId },
      select: { id: true, name: true, order: true, probability: true },
      orderBy: { order: 'asc' },
    });
  }

  async create(tenantId: string, userId: string, input: CreateDealInput) {
    const name = input.name?.trim();
    if (!name) {
      throw new BadRequestException('name is required');
    }

    const value = this.normalizeValue(input.value);

    if (!input.stageId) throw new BadRequestException('stageId is required');
    if (!input.customerId)
      throw new BadRequestException('customerId is required');

    await this.assertStageBelongsToTenant(tenantId, input.stageId);
    await this.assertCustomerBelongsToTenant(tenantId, input.customerId);
    if (input.accountId) {
      await this.assertAccountBelongsToTenant(tenantId, input.accountId);
    }
    if (input.unitId) {
      await this.assertUnitBelongsToTenant(tenantId, input.unitId);
    }

    // Prefer explicit accountId; otherwise inherit from the contact when present.
    let accountId = input.accountId || null;
    if (!accountId) {
      const customer = await this.prisma.customer.findFirst({
        where: { id: input.customerId, tenantId },
        select: { accountId: true },
      });
      accountId = customer?.accountId ?? null;
    }

    const deal = await this.prisma.deal.create({
      data: {
        tenantId,
        name,
        value,
        stageId: input.stageId,
        customerId: input.customerId,
        accountId,
        unitId: input.unitId || null,
      },
      include: dealInclude,
    });

    await this.recordAudit(tenantId, userId, 'deal.created', deal.id);

    return deal;
  }

  async update(
    tenantId: string,
    userId: string,
    id: string,
    input: UpdateDealInput,
  ) {
    const existing = await this.prisma.deal.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Deal ${id} was not found`);
    }

    if (input.stageId) {
      await this.assertStageBelongsToTenant(tenantId, input.stageId);
    }
    if (input.customerId) {
      await this.assertCustomerBelongsToTenant(tenantId, input.customerId);
    }
    if (input.accountId) {
      await this.assertAccountBelongsToTenant(tenantId, input.accountId);
    }
    if (input.unitId) {
      await this.assertUnitBelongsToTenant(tenantId, input.unitId);
    }

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new BadRequestException('name cannot be empty');
      data.name = name;
    }
    if (input.value !== undefined) data.value = this.normalizeValue(input.value);
    if (input.stageId !== undefined) data.stageId = input.stageId;
    if (input.customerId !== undefined) data.customerId = input.customerId;
    if (input.accountId !== undefined) data.accountId = input.accountId || null;
    if (input.unitId !== undefined) data.unitId = input.unitId || null;

    const deal = await this.prisma.deal.update({
      where: { id },
      data,
      include: dealInclude,
    });

    await this.recordAudit(tenantId, userId, 'deal.updated', deal.id);

    return deal;
  }

  async moveStage(
    tenantId: string,
    userId: string,
    id: string,
    stageId: string,
  ) {
    if (!stageId) throw new BadRequestException('stageId is required');

    const existing = await this.prisma.deal.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Deal ${id} was not found`);
    }

    await this.assertStageBelongsToTenant(tenantId, stageId);

    const deal = await this.prisma.deal.update({
      where: { id },
      data: { stageId },
      include: dealInclude,
    });

    await this.recordAudit(tenantId, userId, 'deal.stage_changed', deal.id, {
      from: existing.stageId,
      to: stageId,
    });

    return deal;
  }

  async remove(tenantId: string, userId: string, id: string) {
    const existing = await this.prisma.deal.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { contracts: true } } },
    });

    if (!existing) {
      throw new NotFoundException(`Deal ${id} was not found`);
    }

    if (existing._count.contracts > 0) {
      throw new BadRequestException(
        'Cannot delete a deal with linked contracts',
      );
    }

    await this.prisma.deal.delete({ where: { id } });
    await this.recordAudit(tenantId, userId, 'deal.deleted', id);

    return { id, deleted: true };
  }

  private normalizeValue(value: number | string): string {
    const parsed = typeof value === 'string' ? Number(value) : value;

    if (value === undefined || value === null || Number.isNaN(parsed)) {
      throw new BadRequestException('value must be a valid number');
    }
    if (parsed < 0) {
      throw new BadRequestException('value cannot be negative');
    }

    return parsed.toFixed(2);
  }

  private async assertStageBelongsToTenant(tenantId: string, stageId: string) {
    const stage = await this.prisma.dealStage.findFirst({
      where: { id: stageId, tenantId },
    });
    if (!stage) {
      throw new BadRequestException(`Deal stage ${stageId} was not found`);
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

  private async assertAccountBelongsToTenant(
    tenantId: string,
    accountId: string,
  ) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, tenantId },
    });
    if (!account) {
      throw new BadRequestException(`Account ${accountId} was not found`);
    }
  }

  private async assertUnitBelongsToTenant(tenantId: string, unitId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id: unitId, tenantId },
    });
    if (!unit) {
      throw new BadRequestException(`Unit ${unitId} was not found`);
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
        entityType: 'Deal',
        entityId,
        newValues,
      },
    });
  }
}