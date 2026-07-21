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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const password_service_1 = require("../auth/password.service");
const prisma_service_1 = require("../database/prisma.service");
let UsersService = class UsersService {
    prisma;
    passwords;
    constructor(prisma, passwords) {
        this.prisma = prisma;
        this.passwords = passwords;
    }
    async listUsers() {
        const users = await this.prisma.user.findMany({
            where: {},
            orderBy: { createdAt: 'desc' },
            include: {
                roles: {
                    include: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        return users.map((user) => {
            const primaryRole = user.roles[0]?.role;
            return {
                id: user.id,
                name: `${user.firstName} ${user.lastName}`.trim(),
                email: user.email,
                status: user.isActive ? 'active' : 'inactive',
                createdAt: user.createdAt,
                roleId: primaryRole?.id,
                roleName: primaryRole?.name,
            };
        });
    }
    async inviteUser(input) {
        const role = await this.prisma.role.findFirst({
            where: {
                id: input.roleId,
            },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role ${input.roleId} was not found`);
        }
        const { firstName, lastName } = this.splitName(input.name);
        const password = await this.passwords.hash(input.password ?? 'ChangeMe123!');
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: input.email.trim().toLowerCase(),
                    password,
                    firstName,
                    lastName,
                    roles: {
                        create: {
                            roleId: input.roleId,
                        },
                    },
                },
                include: {
                    roles: {
                        include: {
                            role: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });
            await this.prisma.auditLog.create({
                data: {
                    action: 'user.invited',
                    entityType: 'User',
                    entityId: user.id,
                    newValues: {
                        email: user.email,
                        roleId: input.roleId,
                    },
                },
            });
            return user;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.ConflictException('User email already exists');
            }
            throw error;
        }
    }
    splitName(name) {
        const parts = name.trim().split(/\s+/);
        const firstName = parts.shift() ?? 'Invited';
        const lastName = parts.join(' ') || 'User';
        return { firstName, lastName };
    }
    async updateUserRole(id, roleId) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User ${id} was not found`);
        }
        const role = await this.prisma.role.findUnique({ where: { id: roleId } });
        if (!role) {
            throw new common_1.NotFoundException(`Role ${roleId} was not found`);
        }
        await this.prisma.userRole.deleteMany({ where: { userId: id } });
        const userRole = await this.prisma.userRole.create({
            data: {
                userId: id,
                roleId,
            },
            include: {
                role: true,
            },
        });
        await this.prisma.auditLog.create({
            data: {
                action: 'user.role_updated',
                entityType: 'User',
                entityId: id,
                newValues: {
                    roleId,
                    roleName: role.name,
                },
            },
        });
        return userRole;
    }
    async deleteUser(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User ${id} was not found`);
        }
        try {
            await this.prisma.userRole.deleteMany({ where: { userId: id } });
            await this.prisma.user.delete({ where: { id } });
            await this.prisma.auditLog.create({
                data: {
                    action: 'user.deleted',
                    entityType: 'User',
                    entityId: id,
                },
            });
            return { id, deleted: true };
        }
        catch (err) {
            await this.prisma.user.update({
                where: { id },
                data: { isActive: false },
            });
            await this.prisma.auditLog.create({
                data: {
                    action: 'user.deactivated',
                    entityType: 'User',
                    entityId: id,
                },
            });
            return { id, deleted: false, isActive: false };
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        password_service_1.PasswordService])
], UsersService);
//# sourceMappingURL=users.service.js.map