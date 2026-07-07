"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const reservations_types_1 = require("./reservations.types");
const reservationInclude = {
    customer: { select: { id: true, firstName: true, lastName: true } },
    unit: { select: { id: true, unitNumber: true, type: true, status: true } },
    _count: { select: { payments: true } },
};
let ReservationsService = class ReservationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(tenantId) {
        return this.prisma.reservation.findMany({
            where: { tenantId },
            include: reservationInclude,
            orderBy: { date: 'desc' },
        });
    }
    async get(tenantId, id) {
        const reservation = await this.prisma.reservation.findFirst({
            where: { id, tenantId },
            include: reservationInclude,
        });
        if (!reservation) {
            throw new common_1.NotFoundException(`Reservation ${id} was not found`);
        }
        return reservation;
    }
    async create(tenantId, userId, input) {
        if (!input.customerId)
            throw new common_1.BadRequestException('customerId is required');
        if (!input.unitId)
            throw new common_1.BadRequestException('unitId is required');
        const amount = this.normalizeAmount(input.amount);
        const status = this.normalizeStatus(input.status ?? 'PENDING');
        if (!reservations_types_1.ACTIVE_RESERVATION_STATUSES.includes(status)) {
            throw new common_1.BadRequestException(`New reservations must start as one of: ${reservations_types_1.ACTIVE_RESERVATION_STATUSES.join(', ')}`);
        }
        await this.assertCustomerBelongsToTenant(tenantId, input.customerId);
        return this.prisma.$transaction(async (tx) => {
            const unit = await tx.unit.findFirst({
                where: { id: input.unitId, tenantId },
            });
            if (!unit) {
                throw new common_1.BadRequestException(`Unit ${input.unitId} was not found`);
            }
            if (unit.status !== 'AVAILABLE') {
                throw new common_1.BadRequestException(`Unit ${unit.unitNumber} is ${unit.status.toLowerCase()}, not available`);
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
    async update(tenantId, userId, id, input) {
        const existing = await this.prisma.reservation.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Reservation ${id} was not found`);
        }
        const data = {};
        if (input.amount !== undefined)
            data.amount = this.normalizeAmount(input.amount);
        if (input.date !== undefined)
            data.date = this.normalizeDate(input.date);
        const reservation = await this.prisma.reservation.update({
            where: { id },
            data,
            include: reservationInclude,
        });
        await this.recordAudit(tenantId, userId, 'reservation.updated', id);
        return reservation;
    }
    async updateStatus(tenantId, userId, id, status) {
        const next = this.normalizeStatus(status);
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.reservation.findFirst({
                where: { id, tenantId },
                include: { unit: true },
            });
            if (!existing) {
                throw new common_1.NotFoundException(`Reservation ${id} was not found`);
            }
            const wasActive = reservations_types_1.ACTIVE_RESERVATION_STATUSES.includes(existing.status);
            const willBeActive = reservations_types_1.ACTIVE_RESERVATION_STATUSES.includes(next);
            let unitTransition;
            if (wasActive && !willBeActive) {
                if (existing.unit.status === 'RESERVED') {
                    await tx.unit.update({
                        where: { id: existing.unitId },
                        data: { status: 'AVAILABLE' },
                    });
                    unitTransition = 'RESERVED -> AVAILABLE';
                }
            }
            if (!wasActive && willBeActive) {
                if (existing.unit.status !== 'AVAILABLE') {
                    throw new common_1.BadRequestException(`Unit ${existing.unit.unitNumber} is ${existing.unit.status.toLowerCase()}, not available`);
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
    async remove(tenantId, userId, id) {
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.reservation.findFirst({
                where: { id, tenantId },
                include: { unit: true, _count: { select: { payments: true } } },
            });
            if (!existing) {
                throw new common_1.NotFoundException(`Reservation ${id} was not found`);
            }
            if (existing._count.payments > 0) {
                throw new common_1.BadRequestException('Cannot delete a reservation with linked payments');
            }
            const isActive = reservations_types_1.ACTIVE_RESERVATION_STATUSES.includes(existing.status);
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
    normalizeStatus(status) {
        const upper = status?.trim().toUpperCase();
        if (!reservations_types_1.RESERVATION_STATUSES.includes(upper)) {
            throw new common_1.BadRequestException(`status must be one of: ${reservations_types_1.RESERVATION_STATUSES.join(', ')}`);
        }
        return upper;
    }
    normalizeAmount(value) {
        const parsed = typeof value === 'string' ? Number(value) : value;
        if (value === undefined || value === null || Number.isNaN(parsed)) {
            throw new common_1.BadRequestException('amount must be a valid number');
        }
        if (parsed < 0) {
            throw new common_1.BadRequestException('amount cannot be negative');
        }
        return parsed.toFixed(2);
    }
    normalizeDate(value) {
        const date = new Date(value);
        if (!value || Number.isNaN(date.getTime())) {
            throw new common_1.BadRequestException('date must be a valid date');
        }
        return date;
    }
    async assertCustomerBelongsToTenant(tenantId, customerId) {
        const customer = await this.prisma.customer.findFirst({
            where: { id: customerId, tenantId },
        });
        if (!customer) {
            throw new common_1.BadRequestException(`Customer ${customerId} was not found`);
        }
    }
    recordAudit(tenantId, userId, action, entityId) {
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
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map