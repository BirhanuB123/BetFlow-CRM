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
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let PropertiesService = class PropertiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listBuildings(tenantId, projectId) {
        const buildings = await this.prisma.building.findMany({
            where: { tenantId, ...(projectId ? { projectId } : {}) },
            include: {
                project: { select: { id: true, name: true } },
                _count: { select: { floors: true } },
            },
            orderBy: { name: 'asc' },
        });
        return Promise.all(buildings.map(async (building) => ({
            ...building,
            unitsCount: await this.prisma.unit.count({
                where: { tenantId, floor: { buildingId: building.id } },
            }),
        })));
    }
    async getBuilding(tenantId, id) {
        const building = await this.prisma.building.findFirst({
            where: { id, tenantId },
            include: {
                project: { select: { id: true, name: true } },
                floors: {
                    include: { _count: { select: { units: true } } },
                    orderBy: { floorNumber: 'asc' },
                },
            },
        });
        if (!building)
            throw new common_1.NotFoundException(`Building ${id} was not found`);
        return building;
    }
    async createBuilding(tenantId, userId, input) {
        const name = input.name?.trim();
        if (!name)
            throw new common_1.BadRequestException('name is required');
        if (!input.projectId)
            throw new common_1.BadRequestException('projectId is required');
        await this.assertProjectBelongsToTenant(tenantId, input.projectId);
        const building = await this.prisma.building.create({
            data: {
                tenantId,
                projectId: input.projectId,
                name,
                floorsCount: this.normalizeCount(input.floorsCount, 'floorsCount', 1),
            },
            include: {
                project: { select: { id: true, name: true } },
                _count: { select: { floors: true } },
            },
        });
        await this.recordAudit(tenantId, userId, 'building.created', building.id);
        return building;
    }
    async updateBuilding(tenantId, userId, id, input) {
        const existing = await this.prisma.building.findFirst({
            where: { id, tenantId },
        });
        if (!existing)
            throw new common_1.NotFoundException(`Building ${id} was not found`);
        const data = {};
        if (input.name !== undefined) {
            const name = input.name.trim();
            if (!name)
                throw new common_1.BadRequestException('name cannot be empty');
            data.name = name;
        }
        if (input.floorsCount !== undefined)
            data.floorsCount = this.normalizeCount(input.floorsCount, 'floorsCount', 1);
        const building = await this.prisma.building.update({
            where: { id },
            data,
            include: {
                project: { select: { id: true, name: true } },
                _count: { select: { floors: true } },
            },
        });
        await this.recordAudit(tenantId, userId, 'building.updated', building.id);
        return building;
    }
    async removeBuilding(tenantId, userId, id) {
        const existing = await this.prisma.building.findFirst({
            where: { id, tenantId },
            include: { _count: { select: { floors: true } } },
        });
        if (!existing)
            throw new common_1.NotFoundException(`Building ${id} was not found`);
        if (existing._count.floors > 0) {
            throw new common_1.BadRequestException('Cannot delete a building that still has floors');
        }
        await this.prisma.building.delete({ where: { id } });
        await this.recordAudit(tenantId, userId, 'building.deleted', id);
        return { id, deleted: true };
    }
    listFloors(tenantId, buildingId) {
        return this.prisma.floor.findMany({
            where: { tenantId, ...(buildingId ? { buildingId } : {}) },
            include: {
                building: { select: { id: true, name: true } },
                _count: { select: { units: true } },
            },
            orderBy: { floorNumber: 'asc' },
        });
    }
    async createFloor(tenantId, userId, input) {
        if (!input.buildingId)
            throw new common_1.BadRequestException('buildingId is required');
        await this.assertBuildingBelongsToTenant(tenantId, input.buildingId);
        const floor = await this.prisma.floor.create({
            data: {
                tenantId,
                buildingId: input.buildingId,
                floorNumber: this.normalizeCount(input.floorNumber, 'floorNumber', 0),
                name: input.name?.trim() || null,
            },
            include: {
                building: { select: { id: true, name: true } },
                _count: { select: { units: true } },
            },
        });
        await this.recordAudit(tenantId, userId, 'floor.created', floor.id);
        return floor;
    }
    async updateFloor(tenantId, userId, id, input) {
        const existing = await this.prisma.floor.findFirst({
            where: { id, tenantId },
        });
        if (!existing)
            throw new common_1.NotFoundException(`Floor ${id} was not found`);
        const data = {};
        if (input.floorNumber !== undefined)
            data.floorNumber = this.normalizeCount(input.floorNumber, 'floorNumber', 0);
        if (input.name !== undefined)
            data.name = input.name?.trim() || null;
        const floor = await this.prisma.floor.update({
            where: { id },
            data,
            include: {
                building: { select: { id: true, name: true } },
                _count: { select: { units: true } },
            },
        });
        await this.recordAudit(tenantId, userId, 'floor.updated', floor.id);
        return floor;
    }
    async removeFloor(tenantId, userId, id) {
        const existing = await this.prisma.floor.findFirst({
            where: { id, tenantId },
            include: { _count: { select: { units: true } } },
        });
        if (!existing)
            throw new common_1.NotFoundException(`Floor ${id} was not found`);
        if (existing._count.units > 0) {
            throw new common_1.BadRequestException('Cannot delete a floor that still has units');
        }
        await this.prisma.floor.delete({ where: { id } });
        await this.recordAudit(tenantId, userId, 'floor.deleted', id);
        return { id, deleted: true };
    }
    normalizeCount(value, field, min) {
        const n = value ?? min;
        if (!Number.isInteger(n) || n < min) {
            throw new common_1.BadRequestException(`${field} must be an integer >= ${min}`);
        }
        return n;
    }
    async assertProjectBelongsToTenant(tenantId, projectId) {
        const project = await this.prisma.project.findFirst({
            where: { id: projectId, tenantId },
            select: { id: true },
        });
        if (!project)
            throw new common_1.BadRequestException(`Project ${projectId} was not found`);
    }
    async assertBuildingBelongsToTenant(tenantId, buildingId) {
        const building = await this.prisma.building.findFirst({
            where: { id: buildingId, tenantId },
            select: { id: true },
        });
        if (!building)
            throw new common_1.BadRequestException(`Building ${buildingId} was not found`);
    }
    recordAudit(tenantId, userId, action, entityId) {
        return this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action,
                entityType: action.startsWith('building') ? 'Building' : 'Floor',
                entityId,
            },
        });
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map