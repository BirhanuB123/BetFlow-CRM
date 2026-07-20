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
exports.DealsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const dealInclude = {
    stage: { select: { id: true, name: true, order: true, probability: true } },
    customer: { select: { id: true, firstName: true, lastName: true } },
    account: { select: { id: true, name: true } },
    unit: { select: { id: true, unitNumber: true, type: true } },
};
let DealsService = class DealsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list() {
        return this.prisma.deal.findMany({
            where: {},
            include: dealInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    listStages() {
        return this.prisma.dealStage.findMany({
            where: {},
            select: { id: true, name: true, order: true, probability: true },
            orderBy: { order: 'asc' },
        });
    }
    async create(userId, input) {
        const name = input.name?.trim();
        if (!name) {
            throw new common_1.BadRequestException('name is required');
        }
        const value = this.normalizeValue(input.value);
        if (!input.stageId)
            throw new common_1.BadRequestException('stageId is required');
        if (!input.customerId)
            throw new common_1.BadRequestException('customerId is required');
        await this.assertStageBelongsToTenant(input.stageId);
        await this.assertCustomerBelongsToTenant(input.customerId);
        if (input.accountId) {
            await this.assertAccountBelongsToTenant(input.accountId);
        }
        if (input.unitId) {
            await this.assertUnitBelongsToTenant(input.unitId);
        }
        let accountId = input.accountId || null;
        if (!accountId) {
            const customer = await this.prisma.customer.findFirst({
                where: { id: input.customerId },
                select: { accountId: true },
            });
            accountId = customer?.accountId ?? null;
        }
        const deal = await this.prisma.deal.create({
            data: {
                name,
                value,
                stageId: input.stageId,
                customerId: input.customerId,
                accountId,
                unitId: input.unitId || null,
            },
            include: dealInclude,
        });
        await this.recordAudit(userId, 'deal.created', deal.id);
        return deal;
    }
    async update(userId, id, input) {
        const existing = await this.prisma.deal.findFirst({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Deal ${id} was not found`);
        }
        if (input.stageId) {
            await this.assertStageBelongsToTenant(input.stageId);
        }
        if (input.customerId) {
            await this.assertCustomerBelongsToTenant(input.customerId);
        }
        if (input.accountId) {
            await this.assertAccountBelongsToTenant(input.accountId);
        }
        if (input.unitId) {
            await this.assertUnitBelongsToTenant(input.unitId);
        }
        const data = {};
        if (input.name !== undefined) {
            const name = input.name.trim();
            if (!name)
                throw new common_1.BadRequestException('name cannot be empty');
            data.name = name;
        }
        if (input.value !== undefined)
            data.value = this.normalizeValue(input.value);
        if (input.stageId !== undefined)
            data.stageId = input.stageId;
        if (input.customerId !== undefined)
            data.customerId = input.customerId;
        if (input.accountId !== undefined)
            data.accountId = input.accountId || null;
        if (input.unitId !== undefined)
            data.unitId = input.unitId || null;
        const deal = await this.prisma.deal.update({
            where: { id },
            data,
            include: dealInclude,
        });
        await this.recordAudit(userId, 'deal.updated', deal.id);
        return deal;
    }
    async moveStage(userId, id, stageId) {
        if (!stageId)
            throw new common_1.BadRequestException('stageId is required');
        const existing = await this.prisma.deal.findFirst({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Deal ${id} was not found`);
        }
        await this.assertStageBelongsToTenant(stageId);
        const deal = await this.prisma.deal.update({
            where: { id },
            data: { stageId },
            include: dealInclude,
        });
        await this.recordAudit(userId, 'deal.stage_changed', deal.id, {
            from: existing.stageId,
            to: stageId,
        });
        return deal;
    }
    async remove(userId, id) {
        const existing = await this.prisma.deal.findFirst({
            where: { id },
            include: { _count: { select: { contracts: true } } },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Deal ${id} was not found`);
        }
        if (existing._count.contracts > 0) {
            throw new common_1.BadRequestException('Cannot delete a deal with linked contracts');
        }
        await this.prisma.deal.delete({ where: { id } });
        await this.recordAudit(userId, 'deal.deleted', id);
        return { id, deleted: true };
    }
    normalizeValue(value) {
        const parsed = typeof value === 'string' ? Number(value) : value;
        if (value === undefined || value === null || Number.isNaN(parsed)) {
            throw new common_1.BadRequestException('value must be a valid number');
        }
        if (parsed < 0) {
            throw new common_1.BadRequestException('value cannot be negative');
        }
        return parsed.toFixed(2);
    }
    async assertStageBelongsToTenant(stageId) {
        const stage = await this.prisma.dealStage.findFirst({
            where: { id: stageId },
        });
        if (!stage) {
            throw new common_1.BadRequestException(`Deal stage ${stageId} was not found`);
        }
    }
    async assertCustomerBelongsToTenant(customerId) {
        const customer = await this.prisma.customer.findFirst({
            where: { id: customerId },
        });
        if (!customer) {
            throw new common_1.BadRequestException(`Customer ${customerId} was not found`);
        }
    }
    async assertAccountBelongsToTenant(accountId) {
        const account = await this.prisma.account.findFirst({
            where: { id: accountId },
        });
        if (!account) {
            throw new common_1.BadRequestException(`Account ${accountId} was not found`);
        }
    }
    async assertUnitBelongsToTenant(unitId) {
        const unit = await this.prisma.unit.findFirst({
            where: { id: unitId },
        });
        if (!unit) {
            throw new common_1.BadRequestException(`Unit ${unitId} was not found`);
        }
    }
    recordAudit(userId, action, entityId, newValues) {
        return this.prisma.auditLog.create({
            data: { userId, action, entityType: 'Deal', entityId, newValues },
        });
    }
};
exports.DealsService = DealsService;
exports.DealsService = DealsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DealsService);
//# sourceMappingURL=deals.service.js.map