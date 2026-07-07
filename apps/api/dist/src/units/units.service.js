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
exports.UnitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const units_types_1 = require("./units.types");
const unitInclude = {
    floor: {
        select: {
            id: true,
            floorNumber: true,
            name: true,
            building: {
                select: {
                    id: true,
                    name: true,
                    project: { select: { id: true, name: true } },
                },
            },
        },
    },
    _count: { select: { deals: true, reservations: true, contracts: true } },
};
let UnitsService = class UnitsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(tenantId, filters = {}) {
        const where = { tenantId };
        if (filters.status)
            where.status = this.normalizeStatus(filters.status);
        if (filters.floorId)
            where.floorId = filters.floorId;
        return this.prisma.unit.findMany({
            where,
            include: unitInclude,
            orderBy: { unitNumber: 'asc' },
        });
    }
    async get(tenantId, id) {
        const unit = await this.prisma.unit.findFirst({
            where: { id, tenantId },
            include: unitInclude,
        });
        if (!unit) {
            throw new common_1.NotFoundException(`Unit ${id} was not found`);
        }
        return unit;
    }
    async create(tenantId, userId, input) {
        const unitNumber = input.unitNumber?.trim();
        if (!unitNumber)
            throw new common_1.BadRequestException('unitNumber is required');
        const type = input.type?.trim();
        if (!type)
            throw new common_1.BadRequestException('type is required');
        if (!input.floorId)
            throw new common_1.BadRequestException('floorId is required');
        await this.assertFloorBelongsToTenant(tenantId, input.floorId);
        const price = this.normalizePrice(input.price);
        const status = this.normalizeStatus(input.status ?? 'AVAILABLE');
        const unit = await this.prisma.unit.create({
            data: {
                tenantId,
                floorId: input.floorId,
                unitNumber,
                type,
                status,
                price,
                area: input.area ?? null,
            },
            include: unitInclude,
        });
        await this.recordAudit(tenantId, userId, 'unit.created', unit.id);
        return unit;
    }
    async update(tenantId, userId, id, input) {
        const existing = await this.prisma.unit.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Unit ${id} was not found`);
        }
        if (input.floorId) {
            await this.assertFloorBelongsToTenant(tenantId, input.floorId);
        }
        const data = {};
        if (input.floorId !== undefined)
            data.floorId = input.floorId;
        if (input.unitNumber !== undefined) {
            const unitNumber = input.unitNumber.trim();
            if (!unitNumber)
                throw new common_1.BadRequestException('unitNumber cannot be empty');
            data.unitNumber = unitNumber;
        }
        if (input.type !== undefined) {
            const type = input.type.trim();
            if (!type)
                throw new common_1.BadRequestException('type cannot be empty');
            data.type = type;
        }
        if (input.status !== undefined)
            data.status = this.normalizeStatus(input.status);
        if (input.price !== undefined)
            data.price = this.normalizePrice(input.price);
        if (input.area !== undefined)
            data.area = input.area ?? null;
        const unit = await this.prisma.unit.update({
            where: { id },
            data,
            include: unitInclude,
        });
        await this.recordAudit(tenantId, userId, 'unit.updated', unit.id);
        return unit;
    }
    async updateStatus(tenantId, userId, id, status) {
        const normalized = this.normalizeStatus(status);
        const existing = await this.prisma.unit.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Unit ${id} was not found`);
        }
        const unit = await this.prisma.unit.update({
            where: { id },
            data: { status: normalized },
            include: unitInclude,
        });
        await this.recordAudit(tenantId, userId, 'unit.status_changed', unit.id, {
            from: existing.status,
            to: normalized,
        });
        return unit;
    }
    async remove(tenantId, userId, id) {
        const existing = await this.prisma.unit.findFirst({
            where: { id, tenantId },
            include: {
                _count: { select: { deals: true, reservations: true, contracts: true } },
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Unit ${id} was not found`);
        }
        if (existing._count.deals > 0 ||
            existing._count.reservations > 0 ||
            existing._count.contracts > 0) {
            throw new common_1.BadRequestException('Cannot delete a unit with linked deals, reservations, or contracts');
        }
        await this.prisma.unit.delete({ where: { id } });
        await this.recordAudit(tenantId, userId, 'unit.deleted', id);
        return { id, deleted: true };
    }
    normalizeStatus(status) {
        const upper = status?.trim().toUpperCase();
        if (!units_types_1.UNIT_STATUSES.includes(upper)) {
            throw new common_1.BadRequestException(`status must be one of: ${units_types_1.UNIT_STATUSES.join(', ')}`);
        }
        return upper;
    }
    normalizePrice(value) {
        const parsed = typeof value === 'string' ? Number(value) : value;
        if (value === undefined || value === null || Number.isNaN(parsed)) {
            throw new common_1.BadRequestException('price must be a valid number');
        }
        if (parsed < 0) {
            throw new common_1.BadRequestException('price cannot be negative');
        }
        return parsed.toFixed(2);
    }
    async assertFloorBelongsToTenant(tenantId, floorId) {
        const floor = await this.prisma.floor.findFirst({
            where: { id: floorId, tenantId },
        });
        if (!floor) {
            throw new common_1.BadRequestException(`Floor ${floorId} was not found`);
        }
    }
    recordAudit(tenantId, userId, action, entityId, newValues) {
        return this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action,
                entityType: 'Unit',
                entityId,
                newValues,
            },
        });
    }
};
exports.UnitsService = UnitsService;
exports.UnitsService = UnitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UnitsService);
//# sourceMappingURL=units.service.js.map