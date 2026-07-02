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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const tenants_service_1 = require("../tenants/tenants.service");
let RolesService = class RolesService {
    prisma;
    tenants;
    constructor(prisma, tenants) {
        this.prisma = prisma;
        this.tenants = tenants;
    }
    async listRoles(tenantId) {
        if (!tenantId) {
            throw new common_1.BadRequestException('tenantId is required');
        }
        const roles = await this.prisma.role.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
            include: {
                permissions: {
                    where: { tenantId },
                    include: {
                        permission: true,
                    },
                },
            },
        });
        return roles.map((role) => ({
            ...this.tenants.serializeRole(role),
            permissionKeys: role.permissions.map((item) => item.permission.name),
            permissions: role.permissions.map((item) => item.permission),
        }));
    }
    async createRole(input) {
        if (!input.tenantId) {
            throw new common_1.BadRequestException('tenantId is required');
        }
        const permissions = await this.resolvePermissions(input);
        const role = await this.prisma.role.create({
            data: {
                tenantId: input.tenantId,
                name: input.name,
                description: input.description,
                permissions: {
                    create: permissions.map((permission) => ({
                        tenantId: input.tenantId,
                        permissionId: permission.id,
                    })),
                },
            },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
            },
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId: input.tenantId,
                action: 'role.created',
                entityType: 'Role',
                entityId: role.id,
                newValues: {
                    name: role.name,
                    permissionIds: permissions.map((permission) => permission.id),
                },
            },
        });
        return {
            ...this.tenants.serializeRole(role),
            permissionKeys: role.permissions.map((item) => item.permission.name),
            permissions: role.permissions.map((item) => item.permission),
        };
    }
    async resolvePermissions(input) {
        if (input.permissionIds?.length) {
            return this.prisma.permission.findMany({
                where: {
                    tenantId: input.tenantId,
                    id: { in: input.permissionIds },
                },
            });
        }
        if (input.permissionKeys?.length) {
            return this.prisma.permission.findMany({
                where: {
                    tenantId: input.tenantId,
                    name: { in: input.permissionKeys },
                },
            });
        }
        return [];
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tenants_service_1.TenantsService])
], RolesService);
//# sourceMappingURL=roles.service.js.map