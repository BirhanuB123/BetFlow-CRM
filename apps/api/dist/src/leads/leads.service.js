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
};
let LeadsService = class LeadsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(tenantId) {
        return this.prisma.lead.findMany({
            where: { tenantId },
            include: leadInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(tenantId, userId, input) {
        const firstName = input.firstName?.trim();
        const lastName = input.lastName?.trim();
        if (!firstName || !lastName) {
            throw new common_1.BadRequestException('firstName and lastName are required');
        }
        const status = this.normalizeStatus(input.status ?? 'NEW');
        if (input.sourceId) {
            await this.assertSourceBelongsToTenant(tenantId, input.sourceId);
        }
        const lead = await this.prisma.lead.create({
            data: {
                tenantId,
                firstName,
                lastName,
                email: input.email?.trim() || null,
                phone: input.phone?.trim() || null,
                status,
                sourceId: input.sourceId || null,
            },
            include: leadInclude,
        });
        await this.recordAudit(tenantId, userId, 'lead.created', lead.id);
        return lead;
    }
    async updateStatus(tenantId, userId, id, status) {
        const normalized = this.normalizeStatus(status);
        const existing = await this.prisma.lead.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Lead ${id} was not found`);
        }
        const lead = await this.prisma.lead.update({
            where: { id },
            data: { status: normalized },
            include: leadInclude,
        });
        await this.recordAudit(tenantId, userId, 'lead.status_changed', lead.id, {
            from: existing.status,
            to: normalized,
        });
        return lead;
    }
    normalizeStatus(status) {
        const upper = status?.trim().toUpperCase();
        if (!leads_types_1.LEAD_STATUSES.includes(upper)) {
            throw new common_1.BadRequestException(`status must be one of: ${leads_types_1.LEAD_STATUSES.join(', ')}`);
        }
        return upper;
    }
    async assertSourceBelongsToTenant(tenantId, sourceId) {
        const source = await this.prisma.leadSource.findFirst({
            where: { id: sourceId, tenantId },
        });
        if (!source) {
            throw new common_1.BadRequestException(`Lead source ${sourceId} was not found`);
        }
    }
    recordAudit(tenantId, userId, action, entityId, newValues) {
        return this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action,
                entityType: 'Lead',
                entityId,
                newValues,
            },
        });
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map