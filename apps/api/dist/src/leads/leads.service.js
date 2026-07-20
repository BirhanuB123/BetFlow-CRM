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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const leads_types_1 = require("./leads.types");
const leadInclude = {
    source: { select: { id: true, name: true } },
    owner: { select: { id: true, firstName: true, lastName: true } },
};
let LeadsService = class LeadsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list() {
        return this.prisma.lead.findMany({
            where: {},
            include: leadInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    listSources() {
        return this.prisma.leadSource.findMany({
            where: {},
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        });
    }
    async create(userId, input) {
        const firstName = input.firstName?.trim();
        const lastName = input.lastName?.trim();
        if (!firstName || !lastName) {
            throw new common_1.BadRequestException('firstName and lastName are required');
        }
        const status = this.normalizeStatus(input.status ?? 'NEW');
        if (input.sourceId) {
            await this.assertSourceBelongsToTenant(input.sourceId);
        }
        const lead = await this.prisma.lead.create({
            data: {
                firstName,
                lastName,
                company: input.company?.trim() || null,
                email: input.email?.trim() || null,
                phone: input.phone?.trim() || null,
                status,
                sourceId: input.sourceId || null,
                ownerId: input.ownerId || userId,
            },
            include: leadInclude,
        });
        await this.recordAudit(userId, 'lead.created', lead.id);
        return lead;
    }
    async update(userId, id, input) {
        const existing = await this.prisma.lead.findFirst({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Lead ${id} was not found`);
        }
        if (input.sourceId) {
            await this.assertSourceBelongsToTenant(input.sourceId);
        }
        const data = {};
        if (input.firstName !== undefined)
            data.firstName = input.firstName.trim();
        if (input.lastName !== undefined)
            data.lastName = input.lastName.trim();
        if (input.company !== undefined)
            data.company = input.company?.trim() || null;
        if (input.email !== undefined)
            data.email = input.email?.trim() || null;
        if (input.phone !== undefined)
            data.phone = input.phone?.trim() || null;
        if (input.status !== undefined)
            data.status = this.normalizeStatus(input.status);
        if (input.sourceId !== undefined)
            data.sourceId = input.sourceId || null;
        if (input.ownerId !== undefined)
            data.ownerId = input.ownerId || null;
        const lead = await this.prisma.lead.update({
            where: { id },
            data,
            include: leadInclude,
        });
        await this.recordAudit(userId, 'lead.updated', lead.id);
        return lead;
    }
    async remove(userId, id) {
        const existing = await this.prisma.lead.findFirst({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Lead ${id} was not found`);
        }
        await this.prisma.lead.delete({ where: { id } });
        await this.recordAudit(userId, 'lead.deleted', id);
        return { id, deleted: true };
    }
    async updateStatus(userId, id, status) {
        const normalized = this.normalizeStatus(status);
        const existing = await this.prisma.lead.findFirst({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Lead ${id} was not found`);
        }
        const lead = await this.prisma.lead.update({
            where: { id },
            data: { status: normalized },
            include: leadInclude,
        });
        await this.recordAudit(userId, 'lead.status_changed', lead.id, {
            from: existing.status,
            to: normalized,
        });
        return lead;
    }
    async convert(userId, id, input) {
        const lead = await this.prisma.lead.findFirst({ where: { id } });
        if (!lead)
            throw new common_1.NotFoundException(`Lead ${id} was not found`);
        if (lead.convertedAt) {
            throw new common_1.BadRequestException('Lead has already been converted');
        }
        let dealValue;
        if (input.deal) {
            if (!input.deal.name?.trim())
                throw new common_1.BadRequestException('deal.name is required');
            if (!input.deal.stageId)
                throw new common_1.BadRequestException('deal.stageId is required');
            const stage = await this.prisma.dealStage.findFirst({
                where: { id: input.deal.stageId },
            });
            if (!stage)
                throw new common_1.BadRequestException(`Deal stage ${input.deal.stageId} was not found`);
            const parsed = Number(input.deal.value);
            if (Number.isNaN(parsed) || parsed < 0)
                throw new common_1.BadRequestException('deal.value must be a non-negative number');
            dealValue = parsed.toFixed(2);
        }
        if (input.accountId) {
            const account = await this.prisma.account.findFirst({
                where: { id: input.accountId },
                select: { id: true },
            });
            if (!account)
                throw new common_1.BadRequestException(`Account ${input.accountId} was not found`);
        }
        return this.prisma.$transaction(async (tx) => {
            let account = null;
            if (input.accountId) {
                account = await tx.account.findUnique({
                    where: { id: input.accountId },
                    select: { id: true, name: true },
                });
            }
            else if (input.createAccount) {
                const name = lead.company?.trim() || `${lead.firstName} ${lead.lastName}`.trim();
                account = await tx.account.create({
                    data: {
                        name,
                        accountType: 'CUSTOMER',
                        ownerId: lead.ownerId ?? userId,
                    },
                    select: { id: true, name: true },
                });
                await tx.auditLog.create({
                    data: {
                        userId,
                        action: 'account.created',
                        entityType: 'Account',
                        entityId: account.id,
                    },
                });
            }
            const accountId = account?.id ?? null;
            const customer = await tx.customer.create({
                data: {
                    firstName: lead.firstName,
                    lastName: lead.lastName,
                    email: lead.email,
                    phone: lead.phone,
                    accountId,
                },
                select: { id: true, firstName: true, lastName: true },
            });
            await tx.auditLog.create({
                data: {
                    userId,
                    action: 'customer.created',
                    entityType: 'Customer',
                    entityId: customer.id,
                },
            });
            let deal = null;
            if (input.deal && dealValue) {
                deal = await tx.deal.create({
                    data: {
                        name: input.deal.name.trim(),
                        value: dealValue,
                        stageId: input.deal.stageId,
                        customerId: customer.id,
                        accountId,
                    },
                    select: { id: true, name: true },
                });
                await tx.auditLog.create({
                    data: {
                        userId,
                        action: 'deal.created',
                        entityType: 'Deal',
                        entityId: deal.id,
                    },
                });
            }
            const updatedLead = await tx.lead.update({
                where: { id },
                data: {
                    status: 'CONVERTED',
                    convertedAt: new Date(),
                    convertedCustomerId: customer.id,
                },
                include: leadInclude,
            });
            await tx.auditLog.create({
                data: {
                    userId,
                    action: 'lead.converted',
                    entityType: 'Lead',
                    entityId: id,
                    newValues: {
                        customerId: customer.id,
                        ...(accountId ? { accountId } : {}),
                        ...(deal ? { dealId: deal.id } : {}),
                    },
                },
            });
            return { lead: updatedLead, customer, account, deal };
        });
    }
    normalizeStatus(status) {
        const upper = status?.trim().toUpperCase();
        if (!leads_types_1.LEAD_STATUSES.includes(upper)) {
            throw new common_1.BadRequestException(`status must be one of: ${leads_types_1.LEAD_STATUSES.join(', ')}`);
        }
        return upper;
    }
    async assertSourceBelongsToTenant(sourceId) {
        const source = await this.prisma.leadSource.findFirst({
            where: { id: sourceId },
        });
        if (!source) {
            throw new common_1.BadRequestException(`Lead source ${sourceId} was not found`);
        }
    }
    recordAudit(userId, action, entityId, newValues) {
        return this.prisma.auditLog.create({
            data: { userId, action, entityType: 'Lead', entityId, newValues },
        });
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map