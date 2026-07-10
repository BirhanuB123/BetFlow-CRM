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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const projects_types_1 = require("./projects.types");
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(tenantId) {
        const projects = await this.prisma.project.findMany({
            where: { tenantId },
            include: { _count: { select: { buildings: true } } },
            orderBy: { name: 'asc' },
        });
        return Promise.all(projects.map(async (project) => ({
            ...project,
            unitsCount: await this.prisma.unit.count({
                where: { tenantId, floor: { building: { projectId: project.id } } },
            }),
        })));
    }
    async get(tenantId, id) {
        const project = await this.prisma.project.findFirst({
            where: { id, tenantId },
            include: {
                buildings: {
                    include: { _count: { select: { floors: true } } },
                    orderBy: { name: 'asc' },
                },
                _count: { select: { buildings: true } },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project ${id} was not found`);
        }
        const buildings = await Promise.all(project.buildings.map(async (building) => ({
            ...building,
            unitsCount: await this.prisma.unit.count({
                where: { tenantId, floor: { buildingId: building.id } },
            }),
        })));
        const unitsCount = await this.prisma.unit.count({
            where: { tenantId, floor: { building: { projectId: id } } },
        });
        return { ...project, buildings, unitsCount };
    }
    async create(tenantId, userId, input) {
        const name = input.name?.trim();
        if (!name)
            throw new common_1.BadRequestException('name is required');
        const project = await this.prisma.project.create({
            data: {
                tenantId,
                name,
                description: input.description?.trim() || null,
                status: this.normalizeStatus(input.status ?? 'ACTIVE'),
            },
            include: { _count: { select: { buildings: true } } },
        });
        await this.recordAudit(tenantId, userId, 'project.created', project.id);
        return project;
    }
    async update(tenantId, userId, id, input) {
        const existing = await this.prisma.project.findFirst({
            where: { id, tenantId },
        });
        if (!existing)
            throw new common_1.NotFoundException(`Project ${id} was not found`);
        const data = {};
        if (input.name !== undefined) {
            const name = input.name.trim();
            if (!name)
                throw new common_1.BadRequestException('name cannot be empty');
            data.name = name;
        }
        if (input.description !== undefined)
            data.description = input.description?.trim() || null;
        if (input.status !== undefined)
            data.status = this.normalizeStatus(input.status);
        const project = await this.prisma.project.update({
            where: { id },
            data,
            include: { _count: { select: { buildings: true } } },
        });
        await this.recordAudit(tenantId, userId, 'project.updated', project.id);
        return project;
    }
    async remove(tenantId, userId, id) {
        const existing = await this.prisma.project.findFirst({
            where: { id, tenantId },
            include: { _count: { select: { buildings: true } } },
        });
        if (!existing)
            throw new common_1.NotFoundException(`Project ${id} was not found`);
        if (existing._count.buildings > 0) {
            throw new common_1.BadRequestException('Cannot delete a project that still has buildings');
        }
        await this.prisma.project.delete({ where: { id } });
        await this.recordAudit(tenantId, userId, 'project.deleted', id);
        return { id, deleted: true };
    }
    normalizeStatus(status) {
        const upper = status?.trim().toUpperCase().replace(/\s+/g, '_');
        if (!projects_types_1.PROJECT_STATUSES.includes(upper)) {
            throw new common_1.BadRequestException(`status must be one of: ${projects_types_1.PROJECT_STATUSES.join(', ')}`);
        }
        return upper;
    }
    recordAudit(tenantId, userId, action, entityId) {
        return this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action,
                entityType: 'Project',
                entityId,
            },
        });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map