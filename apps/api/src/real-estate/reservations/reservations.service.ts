import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  ACTIVE_RESERVATION_STATUSES,
  CreateReservationInput,
  RESERVATION_STATUSES,
  ReservationStatus,
  UpdateReservationInput,
} from './reservations.types';

const reservationInclude = {
  customer: { select: { id: true, firstName: true, lastName: true } },
  unit: { select: { id: true, unitNumber: true, type: true, status: true } },
  _count: { select: { payments: true } },
} as const;

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.reservation.findMany({
      where: {},
      include: reservationInclude,
      orderBy: { date: 'desc' },
    });
  }

  async get(id: string) {
    const reservation = await this.prisma.reservation.findFirst({
      where: { id },
      include: reservationInclude,
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${id} was not found`);
    }

    return reservation;
  }

  async create(userId: string, input: CreateReservationInput) {
    if (!input.customerId)
      throw new BadRequestException('customerId is required');
    if (!input.unitId) throw new BadRequestException('unitId is required');

    const amount = this.normalizeAmount(input.amount);
    const status = this.normalizeStatus(input.status ?? 'PENDING');

    if (!ACTIVE_RESERVATION_STATUSES.includes(status)) {
      throw new BadRequestException(
        `New reservations must start as one of: ${ACTIVE_RESERVATION_STATUSES.join(', ')}`,
      );
    }

    await this.assertCustomerExists(input.customerId);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Atomic conditional update to prevent double-booking race conditions.
      // SQL row-level check ensures only ONE concurrent transaction succeeds in transitioning AVAILABLE -> RESERVED.
      const updateResult = await tx.unit.updateMany({
        where: {
          id: input.unitId,
          status: 'AVAILABLE',
        },
        data: {
          status: 'RESERVED',
        },
      });

      if (updateResult.count === 0) {
        const unit = await tx.unit.findFirst({
          where: { id: input.unitId },
        });

        if (!unit) {
          throw new BadRequestException(`Unit ${input.unitId} was not found`);
        }
        throw new BadRequestException(
          `Unit ${unit.unitNumber} is ${unit.status.toLowerCase()}, not available`,
        );
      }

      const reservationDate = input.date
        ? this.normalizeDate(input.date)
        : new Date();
      const holdPeriodDays = input.holdPeriodDays || 14;
      const expiryDate = input.expiryDate
        ? this.normalizeDate(input.expiryDate)
        : new Date(
            reservationDate.getTime() + holdPeriodDays * 24 * 60 * 60 * 1000,
          );

      const reservationNumber =
        input.reservationNumber?.trim() ||
        `BF-RES-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

      const reservation = await tx.reservation.create({
        data: {
          reservationNumber,
          customerId: input.customerId,
          unitId: input.unitId,
          amount,
          holdPeriodDays,
          expiryDate,
          paymentMethod: input.paymentMethod || 'BANK_TRANSFER',
          receiptNumber: input.receiptNumber?.trim() || null,
          notes: input.notes?.trim() || null,
          status,
          date: reservationDate,
        },
        include: reservationInclude,
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'reservation.created',
          entityType: 'Reservation',
          entityId: reservation.id,
          newValues: { unitStatus: 'AVAILABLE -> RESERVED' },
        },
      });

      return {
        ...reservation,
        unit: { ...reservation.unit, status: 'RESERVED' },
      };
    });
  }

  async update(userId: string, id: string, input: UpdateReservationInput) {
    const existing = await this.prisma.reservation.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Reservation ${id} was not found`);
    }

    const data: Record<string, unknown> = {};
    if (input.reservationNumber !== undefined)
      data.reservationNumber = input.reservationNumber?.trim() || null;
    if (input.amount !== undefined)
      data.amount = this.normalizeAmount(input.amount);
    if (input.holdPeriodDays !== undefined)
      data.holdPeriodDays = input.holdPeriodDays;
    if (input.expiryDate !== undefined)
      data.expiryDate = input.expiryDate
        ? this.normalizeDate(input.expiryDate)
        : null;
    if (input.paymentMethod !== undefined)
      data.paymentMethod = input.paymentMethod || null;
    if (input.receiptNumber !== undefined)
      data.receiptNumber = input.receiptNumber?.trim() || null;
    if (input.notes !== undefined) data.notes = input.notes?.trim() || null;
    if (input.date !== undefined) data.date = this.normalizeDate(input.date);

    const reservation = await this.prisma.reservation.update({
      where: { id },
      data,
      include: reservationInclude,
    });

    await this.recordAudit(userId, 'reservation.updated', id);

    return reservation;
  }

  async updateStatus(userId: string, id: string, status: string) {
    const next = this.normalizeStatus(status);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.reservation.findFirst({
        where: { id },
        include: { unit: true },
      });

      if (!existing) {
        throw new NotFoundException(`Reservation ${id} was not found`);
      }

      const wasActive = ACTIVE_RESERVATION_STATUSES.includes(
        existing.status as ReservationStatus,
      );
      const willBeActive = ACTIVE_RESERVATION_STATUSES.includes(next);
      let unitTransition: string | undefined;

      if (wasActive && !willBeActive) {
        // Cancelling/expiring an active reservation releases the unit,
        // unless something else already moved it (e.g. SOLD via contract).
        if (existing.unit.status === 'RESERVED') {
          await tx.unit.update({
            where: { id: existing.unitId },
            data: { status: 'AVAILABLE' },
          });
          unitTransition = 'RESERVED -> AVAILABLE';
        }
      }

      if (!wasActive && willBeActive) {
        // Re-activating requires an atomic conditional transition AVAILABLE -> RESERVED
        const updateResult = await tx.unit.updateMany({
          where: {
            id: existing.unitId,
            status: 'AVAILABLE',
          },
          data: {
            status: 'RESERVED',
          },
        });

        if (updateResult.count === 0) {
          throw new BadRequestException(
            `Unit ${existing.unit.unitNumber} is ${existing.unit.status.toLowerCase()}, not available`,
          );
        }
        unitTransition = 'AVAILABLE -> RESERVED';
      }

      const reservation = await tx.reservation.update({
        where: { id },
        data: { status: next },
        include: reservationInclude,
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'reservation.status_changed',
          entityType: 'Reservation',
          entityId: id,
          newValues: {
            from: existing.status,
            to: next,
            ...(unitTransition ? { unitStatus: unitTransition } : {}),
          },
        },
      });

      return reservation;
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.reservation.findFirst({
        where: { id },
        include: { unit: true, _count: { select: { payments: true } } },
      });

      if (!existing) {
        throw new NotFoundException(`Reservation ${id} was not found`);
      }

      if (existing._count.payments > 0) {
        throw new BadRequestException(
          'Cannot delete a reservation with linked payments',
        );
      }

      const isActive = ACTIVE_RESERVATION_STATUSES.includes(
        existing.status as ReservationStatus,
      );
      if (isActive && existing.unit.status === 'RESERVED') {
        await tx.unit.update({
          where: { id: existing.unitId },
          data: { status: 'AVAILABLE' },
        });
      }

      await tx.reservation.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'reservation.deleted',
          entityType: 'Reservation',
          entityId: id,
        },
      });

      return { id, deleted: true };
    });
  }

  async processExpiredReservations(): Promise<number> {
    const now = new Date();

    // 1. Truly abandoned reservations (no bank receipt reference AND no linked payments) -> safe to auto-expire & release unit
    const expiredReservations = await this.prisma.reservation.findMany({
      where: {
        status: { in: ACTIVE_RESERVATION_STATUSES },
        expiryDate: { lte: now },
        OR: [{ receiptNumber: null }, { receiptNumber: '' }],
        payments: { none: {} },
      },
      include: {
        unit: true,
        customer: true,
      },
    });

    let processedCount = 0;

    for (const reservation of expiredReservations) {
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.reservation.update({
          where: { id: reservation.id },
          data: { status: 'EXPIRED' },
        });

        if (reservation.unit.status === 'RESERVED') {
          await tx.unit.update({
            where: { id: reservation.unitId },
            data: { status: 'AVAILABLE' },
          });
        }

        await tx.auditLog.create({
          data: {
            action: 'reservation.auto_expired',
            entityType: 'Reservation',
            entityId: reservation.id,
            newValues: {
              previousStatus: reservation.status,
              newStatus: 'EXPIRED',
              unitStatus: 'RESERVED -> AVAILABLE',
              expiryDate: reservation.expiryDate?.toISOString(),
            },
          },
        });
      });

      processedCount++;
    }

    // 2. Pending Verification Holds: expired reservations with a bank receipt ref or payment attached -> retain unit lock & flag for finance verification
    const pendingVerificationReservations = await this.prisma.reservation.findMany({
      where: {
        status: { in: ACTIVE_RESERVATION_STATUSES },
        expiryDate: { lte: now },
        NOT: {
          AND: [
            { OR: [{ receiptNumber: null }, { receiptNumber: '' }] },
            { payments: { none: {} } },
          ],
        },
      },
      include: {
        unit: true,
        customer: true,
      },
    });

    if (pendingVerificationReservations.length > 0) {
      const activeUsers = await this.prisma.user.findMany({
        where: { isActive: true },
        take: 5,
      });

      for (const res of pendingVerificationReservations) {
        const refCode = res.reservationNumber || res.id;
        for (const user of activeUsers) {
          const existingNotif = await this.prisma.notification.findFirst({
            where: {
              userId: user.id,
              title: { contains: refCode },
            },
          });

          if (!existingNotif) {
            await this.prisma.notification.create({
              data: {
                userId: user.id,
                title: `⚠️ Pending Receipt Verification for Expiring Hold (${refCode})`,
                message: `Reservation for Unit ${res.unit.unitNumber} (${res.customer.firstName} ${res.customer.lastName}) reached expiry but has a bank receipt reference (${res.receiptNumber || 'Payment Linked'}). Unit lock retained for finance verification.`,
              },
            });
          }
        }

        await this.prisma.auditLog.create({
          data: {
            action: 'reservation.expiry_held_for_receipt_verification',
            entityType: 'Reservation',
            entityId: res.id,
            newValues: {
              receiptNumber: res.receiptNumber,
              unitStatus: 'RESERVED (Lock Retained)',
            },
          },
        });
      }
    }

    return processedCount;
  }

  private normalizeStatus(status: string): ReservationStatus {
    const upper = status?.trim().toUpperCase();

    if (!RESERVATION_STATUSES.includes(upper as ReservationStatus)) {
      throw new BadRequestException(
        `status must be one of: ${RESERVATION_STATUSES.join(', ')}`,
      );
    }

    return upper as ReservationStatus;
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

  private async assertCustomerExists(customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId },
    });
    if (!customer) {
      throw new BadRequestException(`Customer ${customerId} was not found`);
    }
  }

  private recordAudit(userId: string, action: string, entityId: string) {
    return this.prisma.auditLog.create({
      data: { userId, action, entityType: 'Reservation', entityId },
    });
  }
}
