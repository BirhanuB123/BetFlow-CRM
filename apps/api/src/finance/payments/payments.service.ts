import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    const schedules = await this.prisma.paymentSchedule.findMany({
      include: {
        contract: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            unit: { select: { id: true, unitNumber: true, type: true } },
          },
        },
        payments: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();

    return schedules.map((schedule) => {
      const contract = schedule.contract;
      const graceDays = contract?.gracePeriodDays ?? 15;
      const penaltyRate = (contract?.penaltyRatePercent ?? 2.0) / 100;

      const graceCutoff = new Date(schedule.dueDate);
      graceCutoff.setDate(graceCutoff.getDate() + graceDays);

      const isOverGrace = now > graceCutoff && schedule.status !== 'PAID';
      let computedPenalty = Number(schedule.penaltyAmount) || 0;
      let lateDaysAfterGrace = 0;
      let isWithinGrace = false;

      if (
        now > schedule.dueDate &&
        now <= graceCutoff &&
        schedule.status !== 'PAID'
      ) {
        isWithinGrace = true;
      }

      if (isOverGrace) {
        const msLate = now.getTime() - graceCutoff.getTime();
        lateDaysAfterGrace = Math.floor(msLate / (1000 * 60 * 60 * 24)) + 1;
        const unpaidAmount = Math.max(
          0,
          Number(schedule.amount) - Number(schedule.paidAmount),
        );

        const penaltyMonths = Math.max(1, Math.ceil(lateDaysAfterGrace / 30));
        computedPenalty = Math.round(
          unpaidAmount * penaltyRate * penaltyMonths,
        );
      }

      return {
        ...schedule,
        gracePeriodDays: graceDays,
        penaltyRatePercent: contract?.penaltyRatePercent ?? 2.0,
        graceCutoffDate: graceCutoff.toISOString(),
        isWithinGrace,
        isOverGrace,
        lateDaysAfterGrace,
        computedPenaltyAmount: computedPenalty,
      };
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
    const scheduleId = input.scheduleId || null;
    const paymentStatus = input.status?.trim() || 'COMPLETED';

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
    if (scheduleId) {
      await this.assertScheduleExists(scheduleId);
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const payment = await tx.payment.create({
        data: {
          amount,
          method,
          receiptNumber: input.receiptNumber?.trim() || null,
          status: paymentStatus,
          date: input.date ? this.normalizeDate(input.date) : new Date(),
          notes: input.notes?.trim() || null,
          contractId,
          reservationId,
          scheduleId,
        },
        include: paymentInclude,
      });

      if (scheduleId) {
        await this.recalculateSchedule(tx, scheduleId);
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: 'payment.created',
          entityType: 'Payment',
          entityId: payment.id,
        },
      });

      return payment;
    });
  }

  async update(userId: string, id: string, input: UpdatePaymentInput) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.payment.findFirst({
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
      const scheduleId =
        input.scheduleId !== undefined
          ? input.scheduleId || null
          : existing.scheduleId;

      if (input.contractId !== undefined || input.reservationId !== undefined) {
        this.assertExactlyOneTarget(contractId, reservationId);
        if (contractId && contractId !== existing.contractId) {
          await this.assertContractExists(contractId);
        }
        if (reservationId && reservationId !== existing.reservationId) {
          await this.assertReservationExists(reservationId);
        }
      }

      if (scheduleId && scheduleId !== existing.scheduleId) {
        await this.assertScheduleExists(scheduleId);
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
      if (input.receiptNumber !== undefined)
        data.receiptNumber = input.receiptNumber?.trim() || null;
      if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
      if (input.contractId !== undefined) data.contractId = contractId;
      if (input.reservationId !== undefined) data.reservationId = reservationId;
      if (input.scheduleId !== undefined) data.scheduleId = scheduleId;

      const payment = await tx.payment.update({
        where: { id },
        data,
        include: paymentInclude,
      });

      const oldScheduleId = existing.scheduleId;
      const newScheduleId = payment.scheduleId;

      if (oldScheduleId) {
        await this.recalculateSchedule(tx, oldScheduleId);
      }
      if (newScheduleId && newScheduleId !== oldScheduleId) {
        await this.recalculateSchedule(tx, newScheduleId);
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: 'payment.updated',
          entityType: 'Payment',
          entityId: payment.id,
        },
      });

      return payment;
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.payment.findFirst({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`Payment ${id} was not found`);
      }

      const scheduleId = existing.scheduleId;

      await tx.payment.delete({ where: { id } });

      if (scheduleId) {
        await this.recalculateSchedule(tx, scheduleId);
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: 'payment.deleted',
          entityType: 'Payment',
          entityId: id,
        },
      });

      return { id, deleted: true };
    });
  }

  private async recalculateSchedule(
    tx: Prisma.TransactionClient,
    scheduleId: string,
  ) {
    const schedule = await tx.paymentSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      return;
    }

    const completedPayments = await tx.payment.findMany({
      where: {
        scheduleId,
        status: 'COMPLETED',
      },
      select: {
        amount: true,
      },
    });

    const totalPaid = completedPayments.reduce(
      (sum: number, p: { amount: unknown }) => sum + Number(p.amount),
      0,
    );

    const totalPaidDecimal = Number(totalPaid.toFixed(2));
    const schedTotal = Number(schedule.amount);

    let newStatus = 'PENDING';
    if (totalPaidDecimal >= schedTotal) {
      newStatus = 'PAID';
    } else if (totalPaidDecimal > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    await tx.paymentSchedule.update({
      where: { id: scheduleId },
      data: {
        paidAmount: totalPaidDecimal,
        status: newStatus,
      },
    });
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

  private async assertScheduleExists(scheduleId: string) {
    const schedule = await this.prisma.paymentSchedule.findFirst({
      where: { id: scheduleId },
    });
    if (!schedule) {
      throw new BadRequestException(
        `Payment schedule ${scheduleId} was not found`,
      );
    }
  }

  private recordAudit(userId: string, action: string, entityId: string) {
    return this.prisma.auditLog.create({
      data: { userId, action, entityType: 'Payment', entityId },
    });
  }
}
