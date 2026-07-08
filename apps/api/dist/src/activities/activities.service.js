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
exports.ActivitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const ACTION_LABELS = {
    'auth.login': 'Signed in',
    'lead.created': 'Lead created',
    'lead.updated': 'Lead updated',
    'lead.status_changed': 'Lead status changed',
    'lead.deleted': 'Lead deleted',
    'customer.created': 'Customer created',
    'customer.updated': 'Customer updated',
    'customer.deleted': 'Customer deleted',
    'deal.created': 'Deal created',
    'deal.updated': 'Deal updated',
    'deal.stage_changed': 'Deal moved stage',
    'deal.deleted': 'Deal deleted',
    'unit.created': 'Unit created',
    'unit.updated': 'Unit updated',
    'unit.status_changed': 'Unit status changed',
    'unit.deleted': 'Unit deleted',
    'reservation.created': 'Reservation created',
    'reservation.updated': 'Reservation updated',
    'reservation.status_changed': 'Reservation status changed',
    'reservation.deleted': 'Reservation deleted',
    'contract.created': 'Contract created',
    'contract.updated': 'Contract updated',
    'contract.signed': 'Contract signed',
    'contract.deleted': 'Contract deleted',
    'payment.created': 'Payment recorded',
    'payment.updated': 'Payment updated',
    'payment.deleted': 'Payment deleted',
    'tenant.registered': 'Workspace created',
    'tenant.updated': 'Workspace settings updated',
    'demo.seeded': 'Demo data seeded',
};
let ActivitiesService = class ActivitiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(tenantId, options = {}) {
        const take = Math.min(Math.max(options.limit ?? 50, 1), 200);
        const logs = await this.prisma.auditLog.findMany({
            where: {
                tenantId,
                ...(options.entityType ? { entityType: options.entityType } : {}),
                ...(options.entityId ? { entityId: options.entityId } : {}),
            },
            include: {
                user: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { createdAt: 'desc' },
            take,
        });
        return logs.map((log) => ({
            id: log.id,
            action: log.action,
            label: this.labelFor(log.action),
            detail: this.detailFor(log.newValues),
            entityType: log.entityType,
            entityId: log.entityId,
            actor: log.user
                ? `${log.user.firstName} ${log.user.lastName}`.trim()
                : 'System',
            createdAt: log.createdAt,
        }));
    }
    labelFor(action) {
        if (ACTION_LABELS[action])
            return ACTION_LABELS[action];
        const words = action.replace(/[._]/g, ' ').trim();
        return words.charAt(0).toUpperCase() + words.slice(1);
    }
    detailFor(newValues) {
        if (!newValues || typeof newValues !== 'object')
            return null;
        const values = newValues;
        if (typeof values.from === 'string' && typeof values.to === 'string') {
            const suffix = typeof values.unitStatus === 'string' ? ` · unit ${values.unitStatus}` : '';
            return `${values.from} → ${values.to}${suffix}`;
        }
        if (typeof values.unitStatus === 'string') {
            return `Unit ${values.unitStatus}`;
        }
        return null;
    }
};
exports.ActivitiesService = ActivitiesService;
exports.ActivitiesService = ActivitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivitiesService);
//# sourceMappingURL=activities.service.js.map