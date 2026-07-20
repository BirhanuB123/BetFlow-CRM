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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const paymentInclude = {
    contract: { select: { id: true, status: true } },
    reservation: { select: { id: true, status: true } },
};
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list() {
        return this.prisma.payment.findMany({
            where: {},
            include: paymentInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    async get(id) {
        const payment = await this.prisma.payment.findFirst({
            where: { id },
            include: paymentInclude,
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment ${id} was not found`);
        }
        return payment;
    }
    async create(userId, input) {
        const amount = this.normalizeAmount(input.amount);
        const method = input.method?.trim();
        if (!method)
            throw new common_1.BadRequestException('method is required');
        const contractId = input.contractId || null;
        const reservationId = input.reservationId || null;
        this.assertExactlyOneTarget(contractId, reservationId);
        if (contractId) {
            await this.assertContractBelongsToTenant(contractId);
        }
        if (reservationId) {
            await this.assertReservationBelongsToTenant(reservationId);
        }
        const payment = await this.prisma.payment.create({
            data: {
                amount,
                method,
                status: input.status?.trim() || 'COMPLETED',
                date: input.date ? this.normalizeDate(input.date) : new Date(),
                contractId,
                reservationId,
            },
            include: paymentInclude,
        });
        await this.recordAudit(userId, 'payment.created', payment.id);
        return payment;
    }
    async update(userId, id, input) {
        const existing = await this.prisma.payment.findFirst({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Payment ${id} was not found`);
        }
        const contractId = input.contractId !== undefined
            ? input.contractId || null
            : existing.contractId;
        const reservationId = input.reservationId !== undefined
            ? input.reservationId || null
            : existing.reservationId;
        if (input.contractId !== undefined || input.reservationId !== undefined) {
            this.assertExactlyOneTarget(contractId, reservationId);
            if (contractId && contractId !== existing.contractId) {
                await this.assertContractBelongsToTenant(contractId);
            }
            if (reservationId && reservationId !== existing.reservationId) {
                await this.assertReservationBelongsToTenant(reservationId);
            }
        }
        const data = {};
        if (input.amount !== undefined)
            data.amount = this.normalizeAmount(input.amount);
        if (input.method !== undefined) {
            const method = input.method.trim();
            if (!method)
                throw new common_1.BadRequestException('method cannot be empty');
            data.method = method;
        }
        if (input.status !== undefined) {
            const status = input.status.trim();
            if (!status)
                throw new common_1.BadRequestException('status cannot be empty');
            data.status = status;
        }
        if (input.date !== undefined)
            data.date = this.normalizeDate(input.date);
        if (input.contractId !== undefined)
            data.contractId = contractId;
        if (input.reservationId !== undefined)
            data.reservationId = reservationId;
        const payment = await this.prisma.payment.update({
            where: { id },
            data,
            include: paymentInclude,
        });
        await this.recordAudit(userId, 'payment.updated', payment.id);
        return payment;
    }
    async remove(userId, id) {
        const existing = await this.prisma.payment.findFirst({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Payment ${id} was not found`);
        }
        await this.prisma.payment.delete({ where: { id } });
        await this.recordAudit(userId, 'payment.deleted', id);
        return { id, deleted: true };
    }
    assertExactlyOneTarget(contractId, reservationId) {
        if (!!contractId === !!reservationId) {
            throw new common_1.BadRequestException('Provide exactly one of contractId or reservationId');
        }
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
    async assertContractBelongsToTenant(contractId) {
        const contract = await this.prisma.contract.findFirst({
            where: { id: contractId },
        });
        if (!contract) {
            throw new common_1.BadRequestException(`Contract ${contractId} was not found`);
        }
    }
    async assertReservationBelongsToTenant(reservationId) {
        const reservation = await this.prisma.reservation.findFirst({
            where: { id: reservationId },
        });
        if (!reservation) {
            throw new common_1.BadRequestException(`Reservation ${reservationId} was not found`);
        }
    }
    recordAudit(userId, action, entityId) {
        return this.prisma.auditLog.create({
            data: { userId, action, entityType: 'Payment', entityId },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map