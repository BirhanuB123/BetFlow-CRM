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
exports.SiteVisitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const site_visits_types_1 = require("./site-visits.types");
const siteVisitInclude = {
    lead: { select: { id: true, firstName: true, lastName: true } },
    customer: { select: { id: true, firstName: true, lastName: true } },
};
let SiteVisitsService = class SiteVisitsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(filters = {}) {
        const where = {};
        if (filters.status)
            where.status = this.normalizeStatus(filters.status);
        if (filters.upcoming)
            where.date = { gte: new Date() };
        return this.prisma.siteVisit.findMany({
            where,
            include: siteVisitInclude,
            orderBy: { date: 'asc' },
        });
    }
    async get(id) {
        const visit = await this.prisma.siteVisit.findFirst({
            where: { id },
            include: siteVisitInclude,
        });
        if (!visit) {
            throw new common_1.NotFoundException(`Site visit ${id} was not found`);
        }
        return visit;
    }
    async create(userId, input) {
        const date = this.normalizeDate(input.date);
        const status = this.normalizeStatus(input.status ?? 'SCHEDULED');
        const leadId = input.leadId || null;
        const customerId = input.customerId || null;
        if (!leadId && !customerId) {
            throw new common_1.BadRequestException('A site visit must reference a lead or a customer');
        }
        if (leadId)
            await this.assertLeadBelongsToTenant(leadId);
        if (customerId)
            await this.assertCustomerBelongsToTenant(customerId);
        const visit = await this.prisma.siteVisit.create({
            data: {
                date,
                status,
                notes: input.notes?.trim() || null,
                leadId,
                customerId,
            },
            include: siteVisitInclude,
        });
        await this.recordAudit(userId, 'site_visit.created', visit.id);
        return visit;
    }
    async update(userId, id, input) {
        const existing = await this.prisma.siteVisit.findFirst({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Site visit ${id} was not found`);
        }
        if (input.leadId)
            await this.assertLeadBelongsToTenant(input.leadId);
        if (input.customerId)
            await this.assertCustomerBelongsToTenant(input.customerId);
        const data = {};
        if (input.date !== undefined)
            data.date = this.normalizeDate(input.date);
        if (input.notes !== undefined)
            data.notes = input.notes?.trim() || null;
        if (input.leadId !== undefined)
            data.leadId = input.leadId || null;
        if (input.customerId !== undefined)
            data.customerId = input.customerId || null;
        const visit = await this.prisma.siteVisit.update({
            where: { id },
            data,
            include: siteVisitInclude,
        });
        await this.recordAudit(userId, 'site_visit.updated', visit.id);
        return visit;
    }
    async updateStatus(userId, id, status) {
        const normalized = this.normalizeStatus(status);
        const existing = await this.prisma.siteVisit.findFirst({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Site visit ${id} was not found`);
        }
        const visit = await this.prisma.siteVisit.update({
            where: { id },
            data: { status: normalized },
            include: siteVisitInclude,
        });
        await this.recordAudit(userId, 'site_visit.status_changed', visit.id, {
            from: existing.status,
            to: normalized,
        });
        return visit;
    }
    async remove(userId, id) {
        const existing = await this.prisma.siteVisit.findFirst({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Site visit ${id} was not found`);
        }
        await this.prisma.siteVisit.delete({ where: { id } });
        await this.recordAudit(userId, 'site_visit.deleted', id);
        return { id, deleted: true };
    }
    normalizeStatus(status) {
        const upper = status?.trim().toUpperCase().replace(/\s+/g, '_');
        if (!site_visits_types_1.SITE_VISIT_STATUSES.includes(upper)) {
            throw new common_1.BadRequestException(`status must be one of: ${site_visits_types_1.SITE_VISIT_STATUSES.join(', ')}`);
        }
        return upper;
    }
    normalizeDate(value) {
        const date = new Date(value);
        if (!value || Number.isNaN(date.getTime())) {
            throw new common_1.BadRequestException('date must be a valid date');
        }
        return date;
    }
    async assertLeadBelongsToTenant(leadId) {
        const lead = await this.prisma.lead.findFirst({
            where: { id: leadId },
        });
        if (!lead) {
            throw new common_1.BadRequestException(`Lead ${leadId} was not found`);
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
    recordAudit(userId, action, entityId, newValues) {
        return this.prisma.auditLog.create({
            data: { userId, action, entityType: 'SiteVisit', entityId, newValues },
        });
    }
};
exports.SiteVisitsService = SiteVisitsService;
exports.SiteVisitsService = SiteVisitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SiteVisitsService);
//# sourceMappingURL=site-visits.service.js.map