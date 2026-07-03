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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const password_service_1 = require("./password.service");
const jwt_service_1 = require("./jwt.service");
const prisma_service_1 = require("../database/prisma.service");
const tenants_service_1 = require("../tenants/tenants.service");
let AuthService = class AuthService {
    prisma;
    jwt;
    passwords;
    tenants;
    constructor(prisma, jwt, passwords, tenants) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.passwords = passwords;
        this.tenants = tenants;
    }
    async register(input) {
        return this.tenants.registerTenant(input);
    }
    async login(input) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { domain: input.tenantSlug.trim().toLowerCase() },
        });
        if (!tenant) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const user = await this.prisma.user.findFirst({
            where: {
                tenantId: tenant.id,
                email: input.email.trim().toLowerCase(),
                isActive: true,
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
        if (!user ||
            !(await this.passwords.verify(input.password, user.password))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.prisma.auditLog.create({
            data: {
                tenantId: tenant.id,
                userId: user.id,
                action: 'auth.login',
                entityType: 'User',
                entityId: user.id,
            },
        });
        const roles = user.roles.map((item) => item.role.name);
        const expiresIn = 3600;
        return {
            accessToken: this.jwt.sign({
                sub: user.id,
                tenantId: tenant.id,
                email: user.email,
                roles,
            }, expiresIn),
            tenant: {
                id: tenant.id,
                name: tenant.name,
                slug: tenant.domain,
                domain: tenant.domain,
            },
            user: this.tenants.serializeUser(user),
            expiresIn,
            authMethod: 'password',
        };
    }
    async currentUser(authenticatedUser) {
        const user = await this.prisma.user.findFirst({
            where: {
                id: authenticatedUser.id,
                tenantId: authenticatedUser.tenantId,
                isActive: true,
            },
            include: {
                tenant: true,
                roles: {
                    where: { tenantId: authenticatedUser.tenantId },
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
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid token subject');
        }
        return {
            tenant: {
                id: user.tenant.id,
                name: user.tenant.name,
                slug: user.tenant.domain,
                domain: user.tenant.domain,
            },
            user: this.tenants.serializeUser(user),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_service_1.JwtService,
        password_service_1.PasswordService,
        tenants_service_1.TenantsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map