import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePaymentInput, UpdatePaymentInput } from './payments.types';

const paymentInclude = {
  contract: {
    select: {
      id: true,
      status: true,
      customer: { select: { firstName: true, lastName: true } },
      unit: { select: { unitNumber: true } },
    },
  },
  reservation: {
    select: {
      id: true,
      status: true,
      customer: { select: { firstName: true, lastName: true } },
      unit: { select: { unitNumber: true } },
    },
  },
  schedule: true,
} as const;

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.payment.findMany({
      where: {},
      include: paymentInclude,
      orderBy: { date: 'desc' },
    });
  }

  async listSchedules() {
    return this.prisma.paymentSchedule.findMany({
      include: {
        contract: {
          include: {
            customer: { select: { id: true, firstName: true, lastName: true } },
            unit: { select: { id: true, unitNumber: true, type: true } },
          },
        },
        payments: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async get(id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id },
      include: paymentInclude,
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${id} was not found`);
    }

    return payment;
  }

  async create(userId: string, input: CreatePaymentInput) {
    const amount = this.normalizeAmount(input.amount);

    const method = input.method?.trim() || 'CBE_BANK_TRANSFER';
    const contractId = input.contractId || null;
    const reservationId = input.reservationId || null;

    if (!contractId && !reservationId) {
      throw new BadRequestException(
        'Provide at least one of contractId or reservationId',
      );
    }

    if (contractId) {
      await this.assertContractExists(contractId);
    }
    if (reservationId) {
      await this.assertReservationExists(reservationId);
    }

    const payment = await this.prisma.payment.create({
      data: {
        amount,
        method,
        receiptNumber: input.receiptNumber?.trim() || null,
        status: 'COMPLETED',
        date: input.date ? this.normalizeDate(input.date) : new Date(),
        notes: input.notes?.trim() || null,
        contractId,
        reservationId,
        scheduleId: input.scheduleId || null,
      },
      include: paymentInclude,
    });

    if (input.scheduleId) {
      const schedule = await this.prisma.paymentSchedule.findFirst({
        where: { id: input.scheduleId },
      });
      if (schedule) {
        const newPaid = Number(schedule.paidAmount) + Number(amount);
        const schedTotal = Number(schedule.amount);
        let newStatus = 'PARTIALLY_PAID';
        if (newPaid >= schedTotal) newStatus = 'PAID';

        await this.prisma.paymentSchedule.update({
          where: { id: input.scheduleId },
          data: {
            paidAmount: newPaid,
            status: newStatus,
          },
        });
      }
    }

    await this.recordAudit(userId, 'payment.created', payment.id);

    return payment;
  }

  async update(userId: string, id: string, input: UpdatePaymentInput) {
    const existing = await this.prisma.payment.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Payment ${id} was not found`);
    }

    const contractId =
      input.contractId !== undefined
        ? input.contractId || null
        : existing.contractId;
    const reservationId =
      input.reservationId !== undefined
        ? input.reservationId || null
        : existing.reservationId;

    if (input.contractId !== undefined || input.reservationId !== undefined) {
      this.assertExactlyOneTarget(contractId, reservationId);
      if (contractId && contractId !== existing.contractId) {
        await this.assertContractExists(contractId);
      }
      if (reservationId && reservationId !== existing.reservationId) {
        await this.assertReservationExists(reservationId);
      }
    }

    const data: Record<string, unknown> = {};
    if (input.amount !== undefined)
      data.amount = this.normalizeAmount(input.amount);
    if (input.method !== undefined) {
      const method = input.method.trim();
      if (!method) throw new BadRequestException('method cannot be empty');
      data.method = method;
    }
    if (input.status !== undefined) {
      const status = input.status.trim();
      if (!status) throw new BadRequestException('status cannot be empty');
      data.status = status;
    }
    if (input.date !== undefined) data.date = this.normalizeDate(input.date);
    if (input.contractId !== undefined) data.contractId = contractId;
    if (input.reservationId !== undefined) data.reservationId = reservationId;

    const payment = await this.prisma.payment.update({
      where: { id },
      data,
      include: paymentInclude,
    });

    await this.recordAudit(userId, 'payment.updated', payment.id);

    return payment;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.payment.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Payment ${id} was not found`);
    }

    await this.prisma.payment.delete({ where: { id } });
    await this.recordAudit(userId, 'payment.deleted', id);

    return { id, deleted: true };
  }

  private assertExactlyOneTarget(
    contractId: string | null,
    reservationId: string | null,
  ) {
    if (!!contractId === !!reservationId) {
      throw new BadRequestException(
        'Provide exactly one of contractId or reservationId',
      );
    }
  }

  private normalizeAmount(value: number | string): string {
    const parsed = typeof value === 'string' ? Number(value) : value;

    if (value === undefined || value === null || Number.isNaN(parsed)) {
      throw new BadRequestException('amount must be a valid number');
    }
    if (parsed < 0) {
      throw new BadRequestException('amount cannot be negative');
    }

    return parsed.toFixed(2);
  }

  private normalizeDate(value: string): Date {
    const date = new Date(value);
    if (!value || Number.isNaN(date.getTime())) {
      throw new BadRequestException('date must be a valid date');
    }
    return date;
  }

  private async assertContractExists(contractId: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id: contractId },
    });
    if (!contract) {
      throw new BadRequestException(`Contract ${contractId} was not found`);
    }
  }

  private async assertReservationExists(reservationId: string) {
    const reservation = await this.prisma.reservation.findFirst({
      where: { id: reservationId },
    });
    if (!reservation) {
      throw new BadRequestException(
        `Reservation ${reservationId} was not found`,
      );
    }
  }

  private recordAudit(userId: string, action: string, entityId: string) {
    return this.prisma.auditLog.create({
      data: { userId, action, entityType: 'Payment', entityId },
    });
  }
}
