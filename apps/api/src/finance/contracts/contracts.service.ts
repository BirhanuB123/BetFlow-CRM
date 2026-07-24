import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateContractInput, UpdateContractInput } from './contracts.types';

const contractInclude = {
  customer: { select: { id: true, firstName: true, lastName: true } },
  unit: { select: { id: true, unitNumber: true, type: true, status: true } },
  deal: { select: { id: true, name: true } },
  _count: { select: { payments: true, schedules: true } },
} as const;

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.contract.findMany({
      where: {},
      include: contractInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id },
      include: contractInclude,
    });

    if (!contract) {
      throw new NotFoundException(`Contract ${id} was not found`);
    }

    return contract;
  }

  async create(userId: string, input: CreateContractInput) {
    if (!input.customerId)
      throw new BadRequestException('customerId is required');
    if (!input.unitId) throw new BadRequestException('unitId is required');

    const startDate = this.normalizeDate(input.startDate, 'startDate');
    const endDate =
      input.endDate != null && input.endDate !== ''
        ? this.normalizeDate(input.endDate, 'endDate')
        : null;
    if (endDate && endDate < startDate) {
      throw new BadRequestException('endDate cannot be before startDate');
    }

    const totalAmt = this.normalizeAmount(input.totalAmt);
    const downPaymentAmt =
      input.downPaymentAmt != null && input.downPaymentAmt !== ''
        ? this.normalizeAmount(input.downPaymentAmt)
        : null;

    const contractNumber =
      input.contractNumber?.trim() ||
      `ET-CNT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    await this.assertCustomerBelongsToTenant(input.customerId);
    await this.assertUnitBelongsToTenant(input.unitId);
    if (input.dealId) {
      await this.assertDealBelongsToTenant(input.dealId);
    }

    const contract = await this.prisma.contract.create({
      data: {
        contractNumber,
        contractType: input.contractType || 'SALES_AGREEMENT',
        customerId: input.customerId,
        unitId: input.unitId,
        dealId: input.dealId || null,
        startDate,
        endDate,
        totalAmt,
        downPaymentAmt,
        paymentPlan: input.paymentPlan || 'INSTALLMENTS_24M',
        notes: input.notes?.trim() || null,
        status: input.status?.trim() || 'ACTIVE',
      },
      include: contractInclude,
    });

    await this.recordAudit(userId, 'contract.created', contract.id);

    return contract;
  }

  async update(userId: string, id: string, input: UpdateContractInput) {
    const existing = await this.prisma.contract.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Contract ${id} was not found`);
    }

    if (input.customerId) {
      await this.assertCustomerBelongsToTenant(input.customerId);
    }
    if (input.unitId) {
      await this.assertUnitBelongsToTenant(input.unitId);
    }
    if (input.dealId) {
      await this.assertDealBelongsToTenant(input.dealId);
    }

    const data: Record<string, unknown> = {};
    if (input.contractNumber !== undefined)
      data.contractNumber = input.contractNumber?.trim() || null;
    if (input.contractType !== undefined)
      data.contractType = input.contractType;
    if (input.customerId !== undefined) data.customerId = input.customerId;
    if (input.unitId !== undefined) data.unitId = input.unitId;
    if (input.dealId !== undefined) data.dealId = input.dealId || null;
    if (input.startDate !== undefined)
      data.startDate = this.normalizeDate(input.startDate, 'startDate');
    if (input.endDate !== undefined)
      data.endDate =
        input.endDate != null && input.endDate !== ''
          ? this.normalizeDate(input.endDate, 'endDate')
          : null;
    if (input.totalAmt !== undefined)
      data.totalAmt = this.normalizeAmount(input.totalAmt);
    if (input.downPaymentAmt !== undefined)
      data.downPaymentAmt =
        input.downPaymentAmt != null && input.downPaymentAmt !== ''
          ? this.normalizeAmount(input.downPaymentAmt)
          : null;
    if (input.paymentPlan !== undefined)
      data.paymentPlan = input.paymentPlan || null;
    if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
    if (input.status !== undefined) {
      const status = input.status.trim();
      if (!status) throw new BadRequestException('status cannot be empty');
      data.status = status;
    }

    // Signing a contract marks the unit as SOLD in the same transaction.
    const becomesSigned =
      typeof data.status === 'string' &&
      data.status.toUpperCase() === 'SIGNED' &&
      existing.status.toUpperCase() !== 'SIGNED';

    if (becomesSigned) {
      const unitId = (data.unitId as string | undefined) ?? existing.unitId;

      return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const contract = await tx.contract.update({
          where: { id },
          data,
          include: contractInclude,
        });

        await tx.unit.update({
          where: { id: unitId },
          data: { status: 'SOLD' },
        });

        await tx.auditLog.create({
          data: {
            userId,
            action: 'contract.signed',
            entityType: 'Contract',
            entityId: contract.id,
            newValues: { unitStatus: 'SOLD' },
          },
        });

        return {
          ...contract,
          unit: { ...contract.unit, status: 'SOLD' },
        };
      });
    }

    const contract = await this.prisma.contract.update({
      where: { id },
      data,
      include: contractInclude,
    });

    await this.recordAudit(userId, 'contract.updated', contract.id);

    return contract;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.contract.findFirst({
      where: { id },
      include: { _count: { select: { payments: true, schedules: true } } },
    });

    if (!existing) {
      throw new NotFoundException(`Contract ${id} was not found`);
    }

    if (existing._count.payments > 0 || existing._count.schedules > 0) {
      throw new BadRequestException(
        'Cannot delete a contract with linked payments or schedules',
      );
    }

    await this.prisma.contract.delete({ where: { id } });
    await this.recordAudit(userId, 'contract.deleted', id);

    return { id, deleted: true };
  }

  private normalizeAmount(value: number | string): string {
    const parsed = typeof value === 'string' ? Number(value) : value;

    if (value === undefined || value === null || Number.isNaN(parsed)) {
      throw new BadRequestException('totalAmt must be a valid number');
    }
    if (parsed < 0) {
      throw new BadRequestException('totalAmt cannot be negative');
    }

    return parsed.toFixed(2);
  }

  private normalizeDate(value: string, field: string): Date {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${field} must be a valid date`);
    }
    return date;
  }

  private async assertCustomerBelongsToTenant(customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId },
    });
    if (!customer) {
      throw new BadRequestException(`Customer ${customerId} was not found`);
    }
  }

  private async assertUnitBelongsToTenant(unitId: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id: unitId },
    });
    if (!unit) {
      throw new BadRequestException(`Unit ${unitId} was not found`);
    }
  }

  private async assertDealBelongsToTenant(dealId: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id: dealId },
    });
    if (!deal) {
      throw new BadRequestException(`Deal ${dealId} was not found`);
    }
  }

  private recordAudit(userId: string, action: string, entityId: string) {
    return this.prisma.auditLog.create({
      data: { userId, action, entityType: 'Contract', entityId },
    });
  }
}
