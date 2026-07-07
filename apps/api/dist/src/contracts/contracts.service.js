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
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const contractInclude = {
    customer: { select: { id: true, firstName: true, lastName: true } },
    unit: { select: { id: true, unitNumber: true, type: true, status: true } },
    deal: { select: { id: true, name: true } },
    _count: { select: { payments: true, schedules: true } },
};
let ContractsService = class ContractsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(tenantId) {
        return this.prisma.contract.findMany({
            where: { tenantId },
            include: contractInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    async get(tenantId, id) {
        const contract = await this.prisma.contract.findFirst({
            where: { id, tenantId },
            include: contractInclude,
        });
        if (!contract) {
            throw new common_1.NotFoundException(`Contract ${id} was not found`);
        }
        return contract;
    }
    async create(tenantId, userId, input) {
        if (!input.customerId)
            throw new common_1.BadRequestException('customerId is required');
        if (!input.unitId)
            throw new common_1.BadRequestException('unitId is required');
        const startDate = this.normalizeDate(input.startDate, 'startDate');
        const endDate = input.endDate != null && input.endDate !== ''
            ? this.normalizeDate(input.endDate, 'endDate')
            : null;
        if (endDate && endDate < startDate) {
            throw new common_1.BadRequestException('endDate cannot be before startDate');
        }
        const totalAmt = this.normalizeAmount(input.totalAmt);
        await this.assertCustomerBelongsToTenant(tenantId, input.customerId);
        await this.assertUnitBelongsToTenant(tenantId, input.unitId);
        if (input.dealId) {
            await this.assertDealBelongsToTenant(tenantId, input.dealId);
        }
        const contract = await this.prisma.contract.create({
            data: {
                tenantId,
                customerId: input.customerId,
                unitId: input.unitId,
                dealId: input.dealId || null,
                startDate,
                endDate,
                totalAmt,
                status: input.status?.trim() || 'ACTIVE',
            },
            include: contractInclude,
        });
        await this.recordAudit(tenantId, userId, 'contract.created', contract.id);
        return contract;
    }
    async update(tenantId, userId, id, input) {
        const existing = await this.prisma.contract.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Contract ${id} was not found`);
        }
        if (input.customerId) {
            await this.assertCustomerBelongsToTenant(tenantId, input.customerId);
        }
        if (input.unitId) {
            await this.assertUnitBelongsToTenant(tenantId, input.unitId);
        }
        if (input.dealId) {
            await this.assertDealBelongsToTenant(tenantId, input.dealId);
        }
        const data = {};
        if (input.customerId !== undefined)
            data.customerId = input.customerId;
        if (input.unitId !== undefined)
            data.unitId = input.unitId;
        if (input.dealId !== undefined)
            data.dealId = input.dealId || null;
        if (input.startDate !== undefined)
            data.startDate = this.normalizeDate(input.startDate, 'startDate');
        if (input.endDate !== undefined)
            data.endDate =
                input.endDate != null && input.endDate !== ''
                    ? this.normalizeDate(input.endDate, 'endDate')
                    : null;
        if (input.totalAmt !== undefined)
            data.totalAmt = this.normalizeAmount(input.totalAmt);
        if (input.status !== undefined) {
            const status = input.status.trim();
            if (!status)
                throw new common_1.BadRequestException('status cannot be empty');
            data.status = status;
        }
        const becomesSigned = typeof data.status === 'string' &&
            data.status.toUpperCase() === 'SIGNED' &&
            existing.status.toUpperCase() !== 'SIGNED';
        if (becomesSigned) {
            const unitId = data.unitId ?? existing.unitId;
            return this.prisma.$transaction(async (tx) => {
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
                        tenantId,
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
        await this.recordAudit(tenantId, userId, 'contract.updated', contract.id);
        return contract;
    }
    async remove(tenantId, userId, id) {
        const existing = await this.prisma.contract.findFirst({
            where: { id, tenantId },
            include: { _count: { select: { payments: true, schedules: true } } },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Contract ${id} was not found`);
        }
        if (existing._count.payments > 0 || existing._count.schedules > 0) {
            throw new common_1.BadRequestException('Cannot delete a contract with linked payments or schedules');
        }
        await this.prisma.contract.delete({ where: { id } });
        await this.recordAudit(tenantId, userId, 'contract.deleted', id);
        return { id, deleted: true };
    }
    normalizeAmount(value) {
        const parsed = typeof value === 'string' ? Number(value) : value;
        if (value === undefined || value === null || Number.isNaN(parsed)) {
            throw new common_1.BadRequestException('totalAmt must be a valid number');
        }
        if (parsed < 0) {
            throw new common_1.BadRequestException('totalAmt cannot be negative');
        }
        return parsed.toFixed(2);
    }
    normalizeDate(value, field) {
        const date = new Date(value);
        if (!value || Number.isNaN(date.getTime())) {
            throw new common_1.BadRequestException(`${field} must be a valid date`);
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
    async assertUnitBelongsToTenant(tenantId, unitId) {
        const unit = await this.prisma.unit.findFirst({
            where: { id: unitId, tenantId },
        });
        if (!unit) {
            throw new common_1.BadRequestException(`Unit ${unitId} was not found`);
        }
    }
    async assertDealBelongsToTenant(tenantId, dealId) {
        const deal = await this.prisma.deal.findFirst({
            where: { id: dealId, tenantId },
        });
        if (!deal) {
            throw new common_1.BadRequestException(`Deal ${dealId} was not found`);
        }
    }
    recordAudit(tenantId, userId, action, entityId) {
        return this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action,
                entityType: 'Contract',
                entityId,
            },
        });
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map