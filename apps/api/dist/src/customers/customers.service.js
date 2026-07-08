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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const customerInclude = {
    _count: { select: { deals: true, contracts: true, reservations: true } },
};
let CustomersService = class CustomersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(tenantId) {
        return this.prisma.customer.findMany({
            where: { tenantId },
            include: customerInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    async get(tenantId, id) {
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
            throw new common_1.NotFoundException(`Customer ${id} was not found`);
        }
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
    async create(tenantId, userId, input) {
        const firstName = input.firstName?.trim();
        const lastName = input.lastName?.trim();
        if (!firstName || !lastName) {
            throw new common_1.BadRequestException('firstName and lastName are required');
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
    async update(tenantId, userId, id, input) {
        const existing = await this.prisma.customer.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Customer ${id} was not found`);
        }
        const data = {};
        if (input.firstName !== undefined) {
            const firstName = input.firstName.trim();
            if (!firstName)
                throw new common_1.BadRequestException('firstName cannot be empty');
            data.firstName = firstName;
        }
        if (input.lastName !== undefined) {
            const lastName = input.lastName.trim();
            if (!lastName)
                throw new common_1.BadRequestException('lastName cannot be empty');
            data.lastName = lastName;
        }
        if (input.email !== undefined)
            data.email = input.email?.trim() || null;
        if (input.phone !== undefined)
            data.phone = input.phone?.trim() || null;
        const customer = await this.prisma.customer.update({
            where: { id },
            data,
            include: customerInclude,
        });
        await this.recordAudit(tenantId, userId, 'customer.updated', customer.id);
        return customer;
    }
    async remove(tenantId, userId, id) {
        const existing = await this.prisma.customer.findFirst({
            where: { id, tenantId },
            include: { _count: { select: { deals: true, contracts: true } } },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Customer ${id} was not found`);
        }
        if (existing._count.deals > 0 || existing._count.contracts > 0) {
            throw new common_1.BadRequestException('Cannot delete a customer with linked deals or contracts');
        }
        await this.prisma.customer.delete({ where: { id } });
        await this.recordAudit(tenantId, userId, 'customer.deleted', id);
        return { id, deleted: true };
    }
    recordAudit(tenantId, userId, action, entityId) {
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
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map