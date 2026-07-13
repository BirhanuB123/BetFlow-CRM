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
exports.TenantsService = exports.SUPPORTED_CURRENCIES = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const password_service_1 = require("../auth/password.service");
const prisma_service_1 = require("../database/prisma.service");
exports.SUPPORTED_CURRENCIES = ['ETB', 'USD', 'EUR', 'GBP', 'KES', 'AED'];
let TenantsService = class TenantsService {
    prisma;
    passwords;
    constructor(prisma, passwords) {
        this.prisma = prisma;
        this.passwords = passwords;
    }
    async registerTenant(input) {
        this.assertTenantRegistration(input);
        const domain = input.slug.trim().toLowerCase();
        const ownerEmail = input.ownerEmail.trim().toLowerCase();
        const ownerName = this.splitName(input.ownerName);
        const passwordHash = await this.passwords.hash(input.password);
        try {
            return await this.prisma.$transaction(async (tx) => {
                const tenant = await tx.tenant.create({
                    data: {
                        name: input.companyName.trim(),
                        domain,
                        currency: 'ETB',
                    },
                });
                const ownerRole = await tx.role.create({
                    data: {
                        tenantId: tenant.id,
                        name: 'Owner',
                        description: 'Full tenant administration access.',
                    },
                });
                const owner = await tx.user.create({
                    data: {
                        tenantId: tenant.id,
                        email: ownerEmail,
                        password: passwordHash,
                        firstName: ownerName.firstName,
                        lastName: ownerName.lastName,
                        roles: {
                            create: {
                                tenantId: tenant.id,
                                roleId: ownerRole.id,
                            },
                        },
                    },
                    include: this.userInclude,
                });
                await tx.subscription.create({
                    data: {
                        tenantId: tenant.id,
                        planName: input.plan ?? 'Starter',
                        startDate: new Date(),
                        status: 'ACTIVE',
                    },
                });
                await tx.auditLog.create({
                    data: {
                        tenantId: tenant.id,
                        userId: owner.id,
                        action: 'tenant.registered',
                        entityType: 'Tenant',
                        entityId: tenant.id,
                        newValues: {
                            companyName: tenant.name,
                            slug: domain,
                            region: input.region ?? null,
                            plan: input.plan ?? 'Starter',
                        },
                    },
                });
                return {
                    tenant: this.serializeTenant(tenant),
                    owner: this.serializeUser(owner),
                    roles: [this.serializeRole(ownerRole)],
                };
            });
        }
        catch (error) {
            if (this.isUniqueViolation(error)) {
                throw new common_1.ConflictException('Tenant slug or owner email already exists');
            }
            throw error;
        }
    }
    async listTenants() {
        const tenants = await this.prisma.tenant.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                subscriptions: {
                    orderBy: { startDate: 'desc' },
                    take: 1,
                },
                users: {
                    where: { roles: { some: { role: { name: 'Owner' } } } },
                    take: 1,
                },
            },
        });
        return tenants.map((tenant) => this.serializeTenant({
            ...tenant,
            ownerUserId: tenant.users[0]?.id,
            plan: tenant.subscriptions[0]?.planName,
        }));
    }
    async getTenant(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                subscriptions: {
                    orderBy: { startDate: 'desc' },
                    take: 1,
                },
                users: {
                    where: { roles: { some: { role: { name: 'Owner' } } } },
                    take: 1,
                },
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant ${id} was not found`);
        }
        return this.serializeTenant({
            ...tenant,
            ownerUserId: tenant.users[0]?.id,
            plan: tenant.subscriptions[0]?.planName,
        });
    }
    async updateTenant(authenticatedTenantId, id, input) {
        if (authenticatedTenantId !== id) {
            throw new common_1.ForbiddenException('Tenant settings can only be changed for the authenticated tenant');
        }
        await this.getTenant(id);
        const data = {};
        if (input.name !== undefined)
            data.name = input.name.trim();
        if (input.domain !== undefined)
            data.domain = input.domain.trim().toLowerCase();
        if (input.currency !== undefined)
            data.currency = this.normalizeCurrency(input.currency);
        const tenant = await this.prisma.tenant.update({
            where: { id },
            data,
        });
        await this.prisma.auditLog.create({
            data: {
                tenantId: id,
                action: 'tenant.updated',
                entityType: 'Tenant',
                entityId: id,
                newValues: data,
            },
        });
        return this.serializeTenant(tenant);
    }
    serializeUser(user) {
        const primaryRole = user.roles?.[0]?.role;
        return {
            id: user.id,
            tenantId: user.tenantId,
            name: [user.firstName, user.lastName].filter(Boolean).join(' '),
            email: user.email,
            roleId: primaryRole?.id,
            roleName: primaryRole?.name,
            status: user.isActive ? 'active' : 'inactive',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    serializeRole(role) {
        return {
            id: role.id,
            tenantId: role.tenantId,
            name: role.name,
            description: role.description,
        };
    }
    assertTenantRegistration(input) {
        if (!input.companyName?.trim()) {
            throw new common_1.BadRequestException('companyName is required');
        }
        if (!input.slug?.trim()) {
            throw new common_1.BadRequestException('slug is required');
        }
        if (!input.ownerName?.trim()) {
            throw new common_1.BadRequestException('ownerName is required');
        }
        if (!input.ownerEmail?.trim()) {
            throw new common_1.BadRequestException('ownerEmail is required');
        }
        if (!input.password || input.password.length < 8) {
            throw new common_1.BadRequestException('password must be at least 8 characters');
        }
    }
    splitName(name) {
        const parts = name.trim().split(/\s+/);
        const firstName = parts.shift() ?? 'Owner';
        const lastName = parts.join(' ') || 'User';
        return { firstName, lastName };
    }
    normalizeCurrency(value) {
        const currency = value.trim().toUpperCase();
        if (!exports.SUPPORTED_CURRENCIES.includes(currency)) {
            throw new common_1.BadRequestException(`currency must be one of: ${exports.SUPPORTED_CURRENCIES.join(', ')}`);
        }
        return currency;
    }
    serializeTenant(tenant) {
        return {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.domain,
            domain: tenant.domain,
            currency: tenant.currency ?? 'ETB',
            region: 'US East',
            plan: tenant.plan ?? 'Starter',
            status: 'active',
            ownerUserId: tenant.ownerUserId,
            createdAt: tenant.createdAt,
            updatedAt: tenant.updatedAt,
        };
    }
    isUniqueViolation(error) {
        return (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002');
    }
    userInclude = {
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
    };
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        password_service_1.PasswordService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map