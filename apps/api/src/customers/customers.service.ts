import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from './customers.types';

const customerInclude = {
  _count: { select: { deals: true, contracts: true, reservations: true } },
} as const;

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.customer.findMany({
      where: { tenantId },
      include: customerInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(tenantId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        deals: {
          select: {
            id: true,
            name: true,
            value: true,
            createdAt: true,
            stage: { select: { id: true, name: true, probability: true } },
            unit: { select: { id: true, unitNumber: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        contracts: {
          select: {
            id: true,
            totalAmt: true,
            status: true,
            startDate: true,
            unit: { select: { id: true, unitNumber: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        reservations: {
          select: {
            id: true,
            amount: true,
            status: true,
            date: true,
            unit: { select: { id: true, unitNumber: true } },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer ${id} was not found`);
    }

    // Payments link to a contract or reservation, not the customer directly.
    const payments = await this.prisma.payment.findMany({
      where: {
        tenantId,
        OR: [
          { contract: { customerId: id } },
          { reservation: { customerId: id } },
        ],
      },
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        date: true,
        contractId: true,
        reservationId: true,
      },
      orderBy: { date: 'desc' },
    });

    return { ...customer, payments };
  }

  async create(tenantId: string, userId: string, input: CreateCustomerInput) {
    const firstName = input.firstName?.trim();
    const lastName = input.lastName?.trim();

    if (!firstName || !lastName) {
      throw new BadRequestException('firstName and lastName are required');
    }

    const customer = await this.prisma.customer.create({
      data: {
        tenantId,
        firstName,
        lastName,
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
      },
      include: customerInclude,
    });

    await this.recordAudit(tenantId, userId, 'customer.created', customer.id);

    return customer;
  }

  async update(
    tenantId: string,
    userId: string,
    id: string,
    input: UpdateCustomerInput,
  ) {
    const existing = await this.prisma.customer.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Customer ${id} was not found`);
    }

    const data: Record<string, unknown> = {};
    if (input.firstName !== undefined) {
      const firstName = input.firstName.trim();
      if (!firstName) throw new BadRequestException('firstName cannot be empty');
      data.firstName = firstName;
    }
    if (input.lastName !== undefined) {
      const lastName = input.lastName.trim();
      if (!lastName) throw new BadRequestException('lastName cannot be empty');
      data.lastName = lastName;
    }
    if (input.email !== undefined) data.email = input.email?.trim() || null;
    if (input.phone !== undefined) data.phone = input.phone?.trim() || null;

    const customer = await this.prisma.customer.update({
      where: { id },
      data,
      include: customerInclude,
    });

    await this.recordAudit(tenantId, userId, 'customer.updated', customer.id);

    return customer;
  }

  async remove(tenantId: string, userId: string, id: string) {
    const existing = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { deals: true, contracts: true } } },
    });

    if (!existing) {
      throw new NotFoundException(`Customer ${id} was not found`);
    }

    if (existing._count.deals > 0 || existing._count.contracts > 0) {
      throw new BadRequestException(
        'Cannot delete a customer with linked deals or contracts',
      );
    }

    await this.prisma.customer.delete({ where: { id } });
    await this.recordAudit(tenantId, userId, 'customer.deleted', id);

    return { id, deleted: true };
  }

  private recordAudit(
    tenantId: string,
    userId: string,
    action: string,
    entityId: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action,
        entityType: 'Customer',
        entityId,
      },
    });
  }
}