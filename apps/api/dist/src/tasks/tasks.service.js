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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const tasks_types_1 = require("./tasks.types");
const taskInclude = {
    assignee: { select: { id: true, firstName: true, lastName: true } },
};
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(tenantId, filters = {}) {
        const where = { tenantId };
        if (filters.status)
            where.status = this.normalizeStatus(filters.status);
        else if (filters.open)
            where.status = { not: 'DONE' };
        if (filters.assigneeId)
            where.assigneeId = filters.assigneeId;
        return this.prisma.task.findMany({
            where,
            include: taskInclude,
            orderBy: [{ dueDate: 'asc' }],
        });
    }
    async get(tenantId, id) {
        const task = await this.prisma.task.findFirst({
            where: { id, tenantId },
            include: taskInclude,
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task ${id} was not found`);
        }
        return task;
    }
    async create(tenantId, userId, input) {
        const title = input.title?.trim();
        if (!title)
            throw new common_1.BadRequestException('title is required');
        const status = this.normalizeStatus(input.status ?? 'TODO');
        if (input.assigneeId) {
            await this.assertUserBelongsToTenant(tenantId, input.assigneeId);
        }
        const task = await this.prisma.task.create({
            data: {
                tenantId,
                title,
                description: input.description?.trim() || null,
                dueDate: input.dueDate ? this.normalizeDate(input.dueDate) : null,
                status,
                assigneeId: input.assigneeId || null,
                entityType: input.entityType || null,
                entityId: input.entityId || null,
            },
            include: taskInclude,
        });
        await this.recordAudit(tenantId, userId, 'task.created', task.id);
        return task;
    }
    async update(tenantId, userId, id, input) {
        const existing = await this.prisma.task.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Task ${id} was not found`);
        }
        if (input.assigneeId) {
            await this.assertUserBelongsToTenant(tenantId, input.assigneeId);
        }
        const data = {};
        if (input.title !== undefined) {
            const title = input.title.trim();
            if (!title)
                throw new common_1.BadRequestException('title cannot be empty');
            data.title = title;
        }
        if (input.description !== undefined)
            data.description = input.description?.trim() || null;
        if (input.dueDate !== undefined)
            data.dueDate = input.dueDate ? this.normalizeDate(input.dueDate) : null;
        if (input.status !== undefined)
            data.status = this.normalizeStatus(input.status);
        if (input.assigneeId !== undefined)
            data.assigneeId = input.assigneeId || null;
        if (input.entityType !== undefined)
            data.entityType = input.entityType || null;
        if (input.entityId !== undefined)
            data.entityId = input.entityId || null;
        const task = await this.prisma.task.update({
            where: { id },
            data,
            include: taskInclude,
        });
        await this.recordAudit(tenantId, userId, 'task.updated', task.id);
        return task;
    }
    async updateStatus(tenantId, userId, id, status) {
        const normalized = this.normalizeStatus(status);
        const existing = await this.prisma.task.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Task ${id} was not found`);
        }
        const task = await this.prisma.task.update({
            where: { id },
            data: { status: normalized },
            include: taskInclude,
        });
        await this.recordAudit(tenantId, userId, 'task.status_changed', task.id, {
            from: existing.status,
            to: normalized,
        });
        return task;
    }
    async remove(tenantId, userId, id) {
        const existing = await this.prisma.task.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Task ${id} was not found`);
        }
        await this.prisma.task.delete({ where: { id } });
        await this.recordAudit(tenantId, userId, 'task.deleted', id);
        return { id, deleted: true };
    }
    normalizeStatus(status) {
        const upper = status?.trim().toUpperCase().replace(/\s+/g, '_');
        if (!tasks_types_1.TASK_STATUSES.includes(upper)) {
            throw new common_1.BadRequestException(`status must be one of: ${tasks_types_1.TASK_STATUSES.join(', ')}`);
        }
        return upper;
    }
    normalizeDate(value) {
        const date = new Date(value);
        if (!value || Number.isNaN(date.getTime())) {
            throw new common_1.BadRequestException('dueDate must be a valid date');
        }
        return date;
    }
    async assertUserBelongsToTenant(tenantId, userId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, tenantId },
        });
        if (!user) {
            throw new common_1.BadRequestException(`User ${userId} was not found`);
        }
    }
    recordAudit(tenantId, userId, action, entityId, newValues) {
        return this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action,
                entityType: 'Task',
                entityId,
                newValues,
            },
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map