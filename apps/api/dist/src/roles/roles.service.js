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
let RolesService = class RolesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listRoles() {
        const roles = await this.prisma.role.findMany({
            where: {},
            orderBy: { name: 'asc' },
            include: {
                permissions: {
                    where: {},
                    include: {
                        permission: true,
                    },
                },
            },
        });
        return roles.map((role) => ({
            ...role,
            permissionKeys: role.permissions.map((item) => item.permission.name),
            permissions: role.permissions.map((item) => item.permission),
        }));
    }
    async createRole(input) {
        const permissions = await this.resolvePermissions(input);
        const role = await this.prisma.role.create({
            data: {
                name: input.name,
                description: input.description,
                permissions: {
                    create: permissions.map((permission) => ({
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
            ...role,
            permissionKeys: role.permissions.map((item) => item.permission.name),
            permissions: role.permissions.map((item) => item.permission),
        };
    }
    async resolvePermissions(input) {
        if (input.permissionIds?.length) {
            return this.prisma.permission.findMany({
                where: {
                    id: { in: input.permissionIds },
                },
            });
        }
        if (input.permissionKeys?.length) {
            return this.prisma.permission.findMany({
                where: {
                    name: { in: input.permissionKeys },
                },
            });
        }
        return [];
    }
    async updateRole(id, body) {
        const existing = await this.prisma.role.findFirst({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Role ${id} was not found`);
        }
        const role = await this.prisma.role.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'role.updated',
                entityType: 'Role',
                entityId: role.id,
                newValues: {
                    name: role.name,
                    description: role.description || '',
                },
            },
        });
        return role;
    }
    async deleteRole(id) {
        const existing = await this.prisma.role.findFirst({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException(`Role ${id} was not found`);
        }
        await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
        await this.prisma.userRole.deleteMany({ where: { roleId: id } });
        await this.prisma.role.delete({ where: { id } });
        await this.prisma.auditLog.create({
            data: {
                action: 'role.deleted',
                entityType: 'Role',
                entityId: id,
            },
        });
        return { id, deleted: true };
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RolesService);
//# sourceMappingURL=roles.service.js.map