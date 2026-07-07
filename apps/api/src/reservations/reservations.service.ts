import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
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

  list(tenantId: string) {
    return this.prisma.reservation.findMany({
      where: { tenantId },
      include: reservationInclude,
      orderBy: { date: 'desc' },
    });
  }

  async get(tenantId: string, id: string) {
    const reservation = await this.prisma.reservation.findFirst({
      where: { id, tenantId },
      include: reservationInclude,
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation ${id} was not found`);
    }

    return reservation;
  }

  async create(
    tenantId: string,
    userId: string,
    input: CreateReservationInput,
  ) {
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

    await this.assertCustomerBelongsToTenant(tenantId, input.customerId);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const unit = await tx.unit.findFirst({
        where: { id: input.unitId, tenantId },
      });

      if (!unit) {
        throw new BadRequestException(`Unit ${input.unitId} was not found`);
      }
      if (unit.status !== 'AVAILABLE') {
        throw new BadRequestException(
          `Unit ${unit.unitNumber} is ${unit.status.toLowerCase()}, not available`,
        );
      }

      const reservation = await tx.reservation.create({
        data: {
          tenantId,
          customerId: input.customerId,
          unitId: input.unitId,
          amount,
          status,
          date: input.date ? this.normalizeDate(input.date) : new Date(),
        },
        include: reservationInclude,
      });

      await tx.unit.update({
        where: { id: unit.id },
        data: { status: 'RESERVED' },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          action: 'reservation.created',
          entityType: 'Reservation',
          entityId: reservation.id,
          newValues: { unitStatus: 'AVAILABLE -> RESERVED' },
        },
      });

      return { ...reservation, unit: { ...reservation.unit, status: 'RESERVED' } };
    });
  }

  async update(
    tenantId: string,
    userId: string,
    id: string,
    input: UpdateReservationInput,
  ) {
    const existing = await this.prisma.reservation.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException(`Reservation ${id} was not found`);
    }

    const data: Record<string, unknown> = {};
    if (input.amount !== undefined)
      data.amount = this.normalizeAmount(input.amount);
    if (input.date !== undefined) data.date = this.normalizeDate(input.date);

    const reservation = await this.prisma.reservation.update({
      where: { id },
      data,
      include: reservationInclude,
    });

    await this.recordAudit(tenantId, userId, 'reservation.updated', id);

    return reservation;
  }

  async updateStatus(
    tenantId: string,
    userId: string,
    id: string,
    status: string,
  ) {
    const next = this.normalizeStatus(status);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.reservation.findFirst({
        where: { id, tenantId },
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
        // Re-activating requires the unit to still be available.
        if (existing.unit.status !== 'AVAILABLE') {
          throw new BadRequestException(
            `Unit ${existing.unit.unitNumber} is ${existing.unit.status.toLowerCase()}, not available`,
          );
        }
        await tx.unit.update({
          where: { id: existing.unitId },
          data: { status: 'RESERVED' },
        });
        unitTransition = 'AVAILABLE -> RESERVED';
      }

      const reservation = await tx.reservation.update({
        where: { id },
        data: { status: next },
        include: reservationInclude,
      });

      await tx.auditLog.create({
        data: {
          tenantId,
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

  async remove(tenantId: string, userId: string, id: string) {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existing = await tx.reservation.findFirst({
        where: { id, tenantId },
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
          tenantId,
          userId,
          action: 'reservation.deleted',
          entityType: 'Reservation',
          entityId: id,
        },
      });

      return { id, deleted: true };
    });
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
        entityType: 'Reservation',
        entityId,
      },
    });
  }
}
