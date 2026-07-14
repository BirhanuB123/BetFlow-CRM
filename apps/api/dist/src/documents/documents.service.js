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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const document_storage_service_1 = require("./document-storage.service");
const DOCUMENT_CATEGORIES = ['ID', 'KYC', 'CONTRACT', 'RECEIPT', 'TITLE_DEED', 'FLOOR_PLAN', 'OTHER'];
const DOCUMENT_STATUSES = ['PENDING_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED'];
const ENTITY_TYPES = ['ACCOUNT', 'CUSTOMER', 'LEAD', 'DEAL', 'SITE_VISIT', 'RESERVATION', 'CONTRACT', 'PAYMENT', 'PROJECT', 'UNIT'];
const documentInclude = {
    uploadedBy: { select: { id: true, firstName: true, lastName: true } },
    reviewedBy: { select: { id: true, firstName: true, lastName: true } },
};
let DocumentsService = class DocumentsService {
    prisma;
    storage;
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
    }
    async list(tenantId, filters = {}) {
        const where = { tenantId };
        if (filters.entityType)
            where.entityType = this.normalizeEntityType(filters.entityType);
        if (filters.entityId)
            where.entityId = filters.entityId;
        if (filters.category)
            where.category = this.normalizeCategory(filters.category);
        if (filters.status)
            where.status = this.normalizeStatus(filters.status);
        const documents = await this.prisma.document.findMany({
            where,
            include: documentInclude,
            orderBy: { uploadedAt: 'desc' },
        });
        return documents.map((document) => this.serialize(document));
    }
    async upload(user, input, file) {
        const category = this.normalizeCategory(input.category ?? 'OTHER');
        const entityType = this.normalizeEntityType(input.entityType ?? 'CUSTOMER');
        const entityId = input.entityId?.trim();
        if (!entityId)
            throw new common_1.BadRequestException('entityId is required');
        await this.assertEntityBelongsToTenant(user.tenantId, entityType, entityId);
        const expiresAt = this.normalizeOptionalDate(input.expiresAt, 'expiresAt');
        const stored = await this.storage.save(user.tenantId, file);
        try {
            const document = await this.prisma.document.create({
                data: {
                    tenantId: user.tenantId,
                    name: file.originalname,
                    fileUrl: '',
                    storageKey: stored.storageKey,
                    mimeType: file.mimetype,
                    sizeBytes: file.size,
                    checksum: stored.checksum,
                    category,
                    status: 'PENDING_REVIEW',
                    entityType,
                    entityId,
                    uploadedById: user.id,
                    expiresAt,
                },
                include: documentInclude,
            });
            const updated = await this.prisma.document.update({
                where: { id: document.id },
                data: { fileUrl: `/api/documents/${document.id}/download` },
                include: documentInclude,
            });
            await this.recordAudit(user, 'document.uploaded', updated.id, {
                category,
                entityType,
                entityId,
                fileName: file.originalname,
            });
            return this.serialize(updated);
        }
        catch (error) {
            await this.storage.remove(stored.storageKey);
            throw error;
        }
    }
    async review(user, id, input) {
        const existing = await this.findForTenant(user.tenantId, id);
        const status = this.normalizeStatus(input.status ?? 'PENDING_REVIEW');
        if (!['VERIFIED', 'REJECTED'].includes(status)) {
            throw new common_1.BadRequestException('Review status must be VERIFIED or REJECTED');
        }
        const rejectionReason = input.rejectionReason?.trim() || null;
        if (status === 'REJECTED' && !rejectionReason) {
            throw new common_1.BadRequestException('A rejection reason is required');
        }
        const document = await this.prisma.document.update({
            where: { id: existing.id },
            data: {
                status,
                reviewedById: user.id,
                reviewedAt: new Date(),
                rejectionReason: status === 'REJECTED' ? rejectionReason : null,
            },
            include: documentInclude,
        });
        await this.recordAudit(user, 'document.reviewed', id, { status, rejectionReason });
        return this.serialize(document);
    }
    async download(tenantId, id) {
        const document = await this.findForTenant(tenantId, id);
        if (!document.storageKey)
            throw new common_1.NotFoundException('Document file is unavailable');
        await this.storage.assertExists(document.storageKey);
        return { document, stream: this.storage.open(document.storageKey) };
    }
    async remove(user, id) {
        const document = await this.findForTenant(user.tenantId, id);
        const canManageAll = user.roles.some((role) => role === 'Owner' || role === 'Admin');
        if (!canManageAll && document.uploadedById !== user.id) {
            throw new common_1.ForbiddenException('Only the uploader or an administrator can delete a document');
        }
        await this.prisma.document.delete({ where: { id } });
        await this.storage.remove(document.storageKey);
        await this.recordAudit(user, 'document.deleted', id, {
            entityType: document.entityType,
            entityId: document.entityId,
            fileName: document.name,
        });
        return { id, deleted: true };
    }
    async findForTenant(tenantId, id) {
        const document = await this.prisma.document.findFirst({
            where: { id, tenantId },
            include: documentInclude,
        });
        if (!document)
            throw new common_1.NotFoundException(`Document ${id} was not found`);
        return document;
    }
    async assertEntityBelongsToTenant(tenantId, entityType, entityId) {
        const where = { id: entityId, tenantId };
        const entity = await ({
            ACCOUNT: () => this.prisma.account.findFirst({ where }),
            CUSTOMER: () => this.prisma.customer.findFirst({ where }),
            LEAD: () => this.prisma.lead.findFirst({ where }),
            DEAL: () => this.prisma.deal.findFirst({ where }),
            SITE_VISIT: () => this.prisma.siteVisit.findFirst({ where }),
            RESERVATION: () => this.prisma.reservation.findFirst({ where }),
            CONTRACT: () => this.prisma.contract.findFirst({ where }),
            PAYMENT: () => this.prisma.payment.findFirst({ where }),
            PROJECT: () => this.prisma.project.findFirst({ where }),
            UNIT: () => this.prisma.unit.findFirst({ where }),
        }[entityType]());
        if (!entity)
            throw new common_1.BadRequestException(`${entityType} ${entityId} was not found`);
    }
    normalizeCategory(value) {
        return this.normalizeFromList(value, DOCUMENT_CATEGORIES, 'category');
    }
    normalizeStatus(value) {
        return this.normalizeFromList(value, DOCUMENT_STATUSES, 'status');
    }
    normalizeEntityType(value) {
        return this.normalizeFromList(value, ENTITY_TYPES, 'entityType');
    }
    normalizeFromList(value, allowed, label) {
        const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, '_');
        if (!allowed.includes(normalized)) {
            throw new common_1.BadRequestException(`${label} must be one of: ${allowed.join(', ')}`);
        }
        return normalized;
    }
    normalizeOptionalDate(value, label) {
        if (!value)
            return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime()))
            throw new common_1.BadRequestException(`${label} must be a valid date`);
        return date;
    }
    serialize(document) {
        return {
            ...document,
            uploadedBy: document.uploadedBy
                ? { id: document.uploadedBy.id, name: `${document.uploadedBy.firstName} ${document.uploadedBy.lastName}`.trim() }
                : null,
            reviewedBy: document.reviewedBy
                ? { id: document.reviewedBy.id, name: `${document.reviewedBy.firstName} ${document.reviewedBy.lastName}`.trim() }
                : null,
        };
    }
    recordAudit(user, action, entityId, newValues) {
        return this.prisma.auditLog.create({
            data: { tenantId: user.tenantId, userId: user.id, action, entityType: 'Document', entityId, newValues: newValues },
        });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        document_storage_service_1.DocumentStorageService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map