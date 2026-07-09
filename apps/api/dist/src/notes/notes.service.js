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
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const noteInclude = {
    author: { select: { id: true, firstName: true, lastName: true } },
};
let NotesService = class NotesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(tenantId, filters = {}) {
        return this.prisma.note.findMany({
            where: {
                tenantId,
                ...(filters.entityType ? { entityType: filters.entityType } : {}),
                ...(filters.entityId ? { entityId: filters.entityId } : {}),
            },
            include: noteInclude,
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(tenantId, userId, input) {
        const content = input.content?.trim();
        if (!content)
            throw new common_1.BadRequestException('content is required');
        if (!input.entityType)
            throw new common_1.BadRequestException('entityType is required');
        if (!input.entityId)
            throw new common_1.BadRequestException('entityId is required');
        const note = await this.prisma.note.create({
            data: {
                tenantId,
                content,
                authorId: userId,
                entityType: input.entityType,
                entityId: input.entityId,
            },
            include: noteInclude,
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'note.created',
                entityType: input.entityType,
                entityId: input.entityId,
                newValues: { preview: content.slice(0, 120) },
            },
        });
        return note;
    }
    async remove(tenantId, userId, id) {
        const existing = await this.prisma.note.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Note ${id} was not found`);
        }
        if (existing.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own notes');
        }
        await this.prisma.note.delete({ where: { id } });
        await this.prisma.auditLog.create({
            data: {
                tenantId,
                userId,
                action: 'note.deleted',
                entityType: existing.entityType,
                entityId: existing.entityId,
            },
        });
        return { id, deleted: true };
    }
};
exports.NotesService = NotesService;
exports.NotesService = NotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotesService);
//# sourceMappingURL=notes.service.js.map