import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { classifyLeadOrigin, normalizePhone } from '@betflow/shared';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerInput, UpdateCustomerInput } from './customers.types';

const customerInclude = {
  account: { select: { id: true, name: true } },
  _count: { select: { deals: true, contracts: true, reservations: true } },
} as const;

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const customers = await this.prisma.customer.findMany({
      where: {},
      include: customerInclude,
      orderBy: { createdAt: 'desc' },
    });

    return customers.map((c) => ({
      ...c,
      diasporaTag: classifyLeadOrigin(c.phone),
    }));
  }

  async get(id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id },
      include: {
        account: { select: { id: true, name: true } },
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

    // Load historical interactions & payments linked to the customer
    const [payments, siteVisits, meetings, callLogs, notes, documents] =
      await Promise.all([
        this.prisma.payment.findMany({
          where: {
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
        }),
        this.prisma.siteVisit.findMany({
          where: { customerId: id },
          orderBy: { date: 'desc' },
        }),
        this.prisma.meeting.findMany({
          where: { customerId: id },
          orderBy: { date: 'desc' },
        }),
        this.prisma.callLog.findMany({
          where: { customerId: id },
          orderBy: { dueDate: 'desc' },
        }),
        this.prisma.note.findMany({
          where: { entityType: 'Customer', entityId: id },
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.document.findMany({
          where: { entityType: 'Customer', entityId: id },
          orderBy: { uploadedAt: 'desc' },
        }),
      ]);

    return {
      ...customer,
      siteVisits,
      meetings,
      callLogs,
      notes,
      documents,
      payments,
    };
  }

  async create(userId: string, input: CreateCustomerInput) {
    const firstName = input.firstName?.trim();
    const lastName = input.lastName?.trim();

    if (!firstName || !lastName) {
      throw new BadRequestException('firstName and lastName are required');
    }

    if (input.accountId) {
      await this.assertAccountExists(input.accountId);
    }

    const normalizedPhone = normalizePhone(input.phone);
    if (normalizedPhone) {
      const existing = await this.prisma.customer.findFirst({
        where: {
          OR: [{ phone: normalizedPhone }, { phone: input.phone?.trim() }],
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Duplicate customer detected: A customer with phone ${normalizedPhone} already exists (${existing.firstName} ${existing.lastName}).`,
        );
      }
    }

    const customer = await this.prisma.customer.create({
      data: {
        firstName,
        lastName,
        email: input.email?.trim() || null,
        phone: normalizedPhone || input.phone?.trim() || null,
        title: input.title?.trim() || null,
        accountId: input.accountId || null,
      },
      include: customerInclude,
    });

    await this.recordAudit(userId, 'customer.created', customer.id);

    return {
      ...customer,
      diasporaTag: classifyLeadOrigin(customer.phone),
    };
  }

  async update(userId: string, id: string, input: UpdateCustomerInput) {
    const existing = await this.prisma.customer.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Customer ${id} was not found`);
    }

    const data: Record<string, unknown> = {};
    if (input.firstName !== undefined) {
      const firstName = input.firstName.trim();
      if (!firstName)
        throw new BadRequestException('firstName cannot be empty');
      data.firstName = firstName;
    }
    if (input.lastName !== undefined) {
      const lastName = input.lastName.trim();
      if (!lastName) throw new BadRequestException('lastName cannot be empty');
      data.lastName = lastName;
    }
    if (input.email !== undefined) data.email = input.email?.trim() || null;
    if (input.phone !== undefined) data.phone = input.phone?.trim() || null;
    if (input.title !== undefined) data.title = input.title?.trim() || null;
    if (input.accountId !== undefined) {
      if (input.accountId) {
        await this.assertAccountExists(input.accountId);
      }
      data.accountId = input.accountId || null;
    }

    const customer = await this.prisma.customer.update({
      where: { id },
      data,
      include: customerInclude,
    });

    await this.recordAudit(userId, 'customer.updated', customer.id);

    return customer;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.customer.findFirst({
      where: { id },
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
    await this.recordAudit(userId, 'customer.deleted', id);

    return { id, deleted: true };
  }

  private async assertAccountExists(accountId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId },
      select: { id: true },
    });
    if (!account) {
      throw new BadRequestException(`Account ${accountId} was not found`);
    }
  }

  private recordAudit(userId: string, action: string, entityId: string) {
    return this.prisma.auditLog.create({
      data: { userId, action, entityType: 'Customer', entityId },
    });
  }
}
