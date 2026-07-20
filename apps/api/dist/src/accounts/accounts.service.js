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
exports.AccountsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const accounts_types_1 = require("./accounts.types");
const ownerSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
};
const accountListInclude = {
    owner: { select: ownerSelect },
    parentAccount: { select: { id: true, name: true } },
    _count: { select: { customers: true, deals: true } },
};
let AccountsService = class AccountsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list() {
        return this.prisma.account.findMany({
            where: {},
            include: accountListInclude,
            orderBy: { updatedAt: 'desc' },
        });
    }
    async get(id) {
        const account = await this.prisma.account.findFirst({
            where: { id },
            include: {
                owner: { select: ownerSelect },
                parentAccount: { select: { id: true, name: true } },
                childAccounts: {
                    select: { id: true, name: true, accountType: true, rating: true },
                    orderBy: { name: 'asc' },
                },
                customers: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        title: true,
                        createdAt: true,
                        _count: { select: { deals: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                deals: {
                    select: {
                        id: true,
                        name: true,
                        value: true,
                        createdAt: true,
                        stage: {
                            select: { id: true, name: true, probability: true },
                        },
                        customer: {
                            select: { id: true, firstName: true, lastName: true },
                        },
                        unit: { select: { id: true, unitNumber: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                _count: { select: { customers: true, deals: true } },
            },
        });
        if (!account) {
            throw new common_1.NotFoundException(`Account ${id} was not found`);
        }
        return account;
    }
    async create(userId, input) {
        const name = input.name?.trim();
        if (!name) {
            throw new common_1.BadRequestException('name is required');
        }
        const accountType = this.normalizeType(input.accountType);
        const rating = this.normalizeRating(input.rating);
        const ownerId = input.ownerId || userId;
        if (input.parentAccountId) {
            await this.assertAccountBelongsToTenant(input.parentAccountId);
        }
        await this.assertOwnerBelongsToTenant(ownerId);
        const account = await this.prisma.account.create({
            data: {
                name,
                accountType,
                industry: this.nullableTrim(input.industry),
                rating,
                phone: this.nullableTrim(input.phone),
                email: this.nullableTrim(input.email)?.toLowerCase() ?? null,
                website: this.nullableTrim(input.website),
                billingStreet: this.nullableTrim(input.billingStreet),
                billingCity: this.nullableTrim(input.billingCity),
                billingState: this.nullableTrim(input.billingState),
                billingCountry: this.nullableTrim(input.billingCountry),
                billingZip: this.nullableTrim(input.billingZip),
                shippingStreet: this.nullableTrim(input.shippingStreet),
                shippingCity: this.nullableTrim(input.shippingCity),
                shippingState: this.nullableTrim(input.shippingState),
                shippingCountry: this.nullableTrim(input.shippingCountry),
                shippingZip: this.nullableTrim(input.shippingZip),
                annualRevenue: this.normalizeRevenue(input.annualRevenue),
                employees: this.normalizeEmployees(input.employees),
                description: this.nullableTrim(input.description),
                parentAccountId: input.parentAccountId || null,
                ownerId,
            },
            include: accountListInclude,
        });
        await this.recordAudit(userId, 'account.created', account.id);
        await this.prisma.activity.create({
            data: {
                type: 'ACCOUNT_CREATED',
                description: `Account "${account.name}" created`,
                userId,
                entityType: 'Account',
                entityId: account.id,
            },
        });
        return account;
    }
    async update(userId, id, input) {
        const existing = await this.prisma.account.findFirst({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Account ${id} was not found`);
        }
        if (input.parentAccountId === id) {
            throw new common_1.BadRequestException('An account cannot be its own parent');
        }
        if (input.parentAccountId) {
            await this.assertAccountBelongsToTenant(input.parentAccountId);
        }
        if (input.ownerId) {
            await this.assertOwnerBelongsToTenant(input.ownerId);
        }
        const data = {};
        if (input.name !== undefined) {
            const name = input.name.trim();
            if (!name)
                throw new common_1.BadRequestException('name cannot be empty');
            data.name = name;
        }
        if (input.accountType !== undefined) {
            data.accountType = this.normalizeType(input.accountType);
        }
        if (input.industry !== undefined) {
            data.industry = this.nullableTrim(input.industry);
        }
        if (input.rating !== undefined) {
            data.rating = this.normalizeRating(input.rating);
        }
        if (input.phone !== undefined)
            data.phone = this.nullableTrim(input.phone);
        if (input.email !== undefined) {
            data.email = this.nullableTrim(input.email)?.toLowerCase() ?? null;
        }
        if (input.website !== undefined) {
            data.website = this.nullableTrim(input.website);
        }
        if (input.billingStreet !== undefined) {
            data.billingStreet = this.nullableTrim(input.billingStreet);
        }
        if (input.billingCity !== undefined) {
            data.billingCity = this.nullableTrim(input.billingCity);
        }
        if (input.billingState !== undefined) {
            data.billingState = this.nullableTrim(input.billingState);
        }
        if (input.billingCountry !== undefined) {
            data.billingCountry = this.nullableTrim(input.billingCountry);
        }
        if (input.billingZip !== undefined) {
            data.billingZip = this.nullableTrim(input.billingZip);
        }
        if (input.shippingStreet !== undefined) {
            data.shippingStreet = this.nullableTrim(input.shippingStreet);
        }
        if (input.shippingCity !== undefined) {
            data.shippingCity = this.nullableTrim(input.shippingCity);
        }
        if (input.shippingState !== undefined) {
            data.shippingState = this.nullableTrim(input.shippingState);
        }
        if (input.shippingCountry !== undefined) {
            data.shippingCountry = this.nullableTrim(input.shippingCountry);
        }
        if (input.shippingZip !== undefined) {
            data.shippingZip = this.nullableTrim(input.shippingZip);
        }
        if (input.annualRevenue !== undefined) {
            data.annualRevenue = this.normalizeRevenue(input.annualRevenue);
        }
        if (input.employees !== undefined) {
            data.employees = this.normalizeEmployees(input.employees);
        }
        if (input.description !== undefined) {
            data.description = this.nullableTrim(input.description);
        }
        if (input.parentAccountId !== undefined) {
            data.parentAccount = input.parentAccountId
                ? { connect: { id: input.parentAccountId } }
                : { disconnect: true };
        }
        if (input.ownerId !== undefined) {
            data.owner = input.ownerId
                ? { connect: { id: input.ownerId } }
                : { disconnect: true };
        }
        const account = await this.prisma.account.update({
            where: { id },
            data,
            include: accountListInclude,
        });
        await this.recordAudit(userId, 'account.updated', account.id);
        return account;
    }
    async remove(userId, id) {
        const existing = await this.prisma.account.findFirst({
            where: { id },
            include: {
                _count: {
                    select: { customers: true, deals: true, childAccounts: true },
                },
            },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Account ${id} was not found`);
        }
        if (existing._count.deals > 0) {
            throw new common_1.BadRequestException('Cannot delete an account with linked deals. Reassign or close deals first.');
        }
        await this.prisma.$transaction([
            this.prisma.customer.updateMany({
                where: { accountId: id },
                data: { accountId: null },
            }),
            this.prisma.account.updateMany({
                where: { parentAccountId: id },
                data: { parentAccountId: null },
            }),
            this.prisma.account.delete({ where: { id } }),
        ]);
        await this.recordAudit(userId, 'account.deleted', id);
        return { id, deleted: true };
    }
    normalizeType(value) {
        if (value === undefined || value === null || value === '')
            return null;
        const upper = value.trim().toUpperCase();
        if (!accounts_types_1.ACCOUNT_TYPES.includes(upper)) {
            throw new common_1.BadRequestException(`accountType must be one of: ${accounts_types_1.ACCOUNT_TYPES.join(', ')}`);
        }
        return upper;
    }
    normalizeRating(value) {
        if (value === undefined || value === null || value === '')
            return null;
        const upper = value.trim().toUpperCase();
        if (!accounts_types_1.ACCOUNT_RATINGS.includes(upper)) {
            throw new common_1.BadRequestException(`rating must be one of: ${accounts_types_1.ACCOUNT_RATINGS.join(', ')}`);
        }
        return upper;
    }
    normalizeRevenue(value) {
        if (value === undefined || value === null || value === '')
            return null;
        const num = typeof value === 'string' ? Number(value) : value;
        if (Number.isNaN(num) || num < 0) {
            throw new common_1.BadRequestException('annualRevenue must be a non-negative number');
        }
        return new client_1.Prisma.Decimal(num);
    }
    normalizeEmployees(value) {
        if (value === undefined || value === null)
            return null;
        if (!Number.isInteger(value) || value < 0) {
            throw new common_1.BadRequestException('employees must be a non-negative integer');
        }
        return value;
    }
    nullableTrim(value) {
        if (value === undefined || value === null)
            return null;
        const trimmed = value.trim();
        return trimmed || null;
    }
    async assertAccountBelongsToTenant(accountId) {
        const account = await this.prisma.account.findFirst({
            where: { id: accountId },
            select: { id: true },
        });
        if (!account) {
            throw new common_1.BadRequestException(`Parent account ${accountId} was not found`);
        }
    }
    async assertOwnerBelongsToTenant(ownerId) {
        const user = await this.prisma.user.findFirst({
            where: { id: ownerId, isActive: true },
            select: { id: true },
        });
        if (!user) {
            throw new common_1.BadRequestException(`Owner ${ownerId} was not found`);
        }
    }
    recordAudit(userId, action, entityId) {
        return this.prisma.auditLog.create({
            data: { userId, action, entityType: 'Account', entityId },
        });
    }
};
exports.AccountsService = AccountsService;
exports.AccountsService = AccountsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccountsService);
//# sourceMappingURL=accounts.service.js.map