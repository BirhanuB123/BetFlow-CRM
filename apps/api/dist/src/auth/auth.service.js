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
let AuthService = class AuthService {
    prisma;
    jwt;
    passwords;
    constructor(prisma, jwt, passwords) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.passwords = passwords;
    }
    async register(input) {
        const email = input.email.trim().toLowerCase();
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new common_1.UnauthorizedException('User already exists');
        }
        const passwordHash = await this.passwords.hash(input.password || 'tempPassword123');
        const adminRole = await this.prisma.role.findFirst({
            where: { name: 'admin' },
        });
        const user = await this.prisma.user.create({
            data: {
                firstName: input.firstName,
                lastName: input.lastName,
                email,
                password: passwordHash,
                roles: adminRole ? {
                    create: [{
                            roleId: adminRole.id
                        }]
                } : undefined
            }
        });
        await this.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'auth.register',
                entityType: 'User',
                entityId: user.id,
            },
        });
        return { success: true, userId: user.id };
    }
    async login(input) {
        const user = await this.prisma.user.findFirst({
            where: {
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
                email: user.email,
                roles,
            }, expiresIn),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            expiresIn,
            authMethod: 'password',
        };
    }
    async currentUser(authenticatedUser) {
        const user = await this.prisma.user.findFirst({
            where: {
                id: authenticatedUser.id,
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
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid token subject');
        }
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_service_1.JwtService,
        password_service_1.PasswordService])
], AuthService);
//# sourceMappingURL=auth.service.js.map