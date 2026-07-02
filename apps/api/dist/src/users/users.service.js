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
const tenants_service_1 = require("../tenants/tenants.service");
let UsersService = class UsersService {
    prisma;
    passwords;
    tenants;
    constructor(prisma, passwords, tenants) {
        this.prisma = prisma;
        this.passwords = passwords;
        this.tenants = tenants;
    }
    async listUsers(tenantId) {
        if (!tenantId) {
            throw new common_1.BadRequestException('tenantId is required');
        }
        const users = await this.prisma.user.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                roles: {
                    where: { tenantId },
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
        return users.map((user) => this.tenants.serializeUser(user));
    }
    async inviteUser(input) {
        if (!input.tenantId) {
            throw new common_1.BadRequestException('tenantId is required');
        }
        const role = await this.prisma.role.findFirst({
            where: {
                id: input.roleId,
                tenantId: input.tenantId,
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
                    tenantId: input.tenantId,
                    email: input.email.trim().toLowerCase(),
                    password,
                    firstName,
                    lastName,
                    roles: {
                        create: {
                            tenantId: input.tenantId,
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
                    tenantId: input.tenantId,
                    action: 'user.invited',
                    entityType: 'User',
                    entityId: user.id,
                    newValues: {
                        email: user.email,
                        roleId: input.roleId,
                    },
                },
            });
            return this.tenants.serializeUser(user);
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        password_service_1.PasswordService,
        tenants_service_1.TenantsService])
], UsersService);
//# sourceMappingURL=users.service.js.map