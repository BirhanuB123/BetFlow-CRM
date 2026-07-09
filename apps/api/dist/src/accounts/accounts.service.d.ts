import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateAccountInput, UpdateAccountInput } from './accounts.types';
export declare class AccountsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string): Prisma.PrismaPromise<({
        parentAccount: {
            id: string;
            name: string;
        } | null;
        owner: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        _count: {
            customers: number;
            deals: number;
        };
    } & {
        id: string;
        email: string | null;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        accountType: string | null;
        industry: string | null;
        rating: string | null;
        phone: string | null;
        website: string | null;
        billingStreet: string | null;
        billingCity: string | null;
        billingState: string | null;
        billingCountry: string | null;
        billingZip: string | null;
        shippingStreet: string | null;
        shippingCity: string | null;
        shippingState: string | null;
        shippingCountry: string | null;
        shippingZip: string | null;
        annualRevenue: Prisma.Decimal | null;
        employees: number | null;
        parentAccountId: string | null;
        ownerId: string | null;
    })[]>;
    get(tenantId: string, id: string): Promise<{
        customers: {
            id: string;
            email: string | null;
            firstName: string;
            lastName: string;
            createdAt: Date;
            phone: string | null;
            title: string | null;
            _count: {
                deals: number;
            };
        }[];
        deals: {
            id: string;
            createdAt: Date;
            name: string;
            unit: {
                id: string;
                unitNumber: string;
            } | null;
            customer: {
                id: string;
                firstName: string;
                lastName: string;
            };
            value: Prisma.Decimal;
            stage: {
                id: string;
                name: string;
                probability: number;
            };
        }[];
        parentAccount: {
            id: string;
            name: string;
        } | null;
        childAccounts: {
            id: string;
            name: string;
            accountType: string | null;
            rating: string | null;
        }[];
        owner: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        _count: {
            customers: number;
            deals: number;
        };
    } & {
        id: string;
        email: string | null;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        accountType: string | null;
        industry: string | null;
        rating: string | null;
        phone: string | null;
        website: string | null;
        billingStreet: string | null;
        billingCity: string | null;
        billingState: string | null;
        billingCountry: string | null;
        billingZip: string | null;
        shippingStreet: string | null;
        shippingCity: string | null;
        shippingState: string | null;
        shippingCountry: string | null;
        shippingZip: string | null;
        annualRevenue: Prisma.Decimal | null;
        employees: number | null;
        parentAccountId: string | null;
        ownerId: string | null;
    }>;
    create(tenantId: string, userId: string, input: CreateAccountInput): Promise<{
        parentAccount: {
            id: string;
            name: string;
        } | null;
        owner: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        _count: {
            customers: number;
            deals: number;
        };
    } & {
        id: string;
        email: string | null;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        accountType: string | null;
        industry: string | null;
        rating: string | null;
        phone: string | null;
        website: string | null;
        billingStreet: string | null;
        billingCity: string | null;
        billingState: string | null;
        billingCountry: string | null;
        billingZip: string | null;
        shippingStreet: string | null;
        shippingCity: string | null;
        shippingState: string | null;
        shippingCountry: string | null;
        shippingZip: string | null;
        annualRevenue: Prisma.Decimal | null;
        employees: number | null;
        parentAccountId: string | null;
        ownerId: string | null;
    }>;
    update(tenantId: string, userId: string, id: string, input: UpdateAccountInput): Promise<{
        parentAccount: {
            id: string;
            name: string;
        } | null;
        owner: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        _count: {
            customers: number;
            deals: number;
        };
    } & {
        id: string;
        email: string | null;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        accountType: string | null;
        industry: string | null;
        rating: string | null;
        phone: string | null;
        website: string | null;
        billingStreet: string | null;
        billingCity: string | null;
        billingState: string | null;
        billingCountry: string | null;
        billingZip: string | null;
        shippingStreet: string | null;
        shippingCity: string | null;
        shippingState: string | null;
        shippingCountry: string | null;
        shippingZip: string | null;
        annualRevenue: Prisma.Decimal | null;
        employees: number | null;
        parentAccountId: string | null;
        ownerId: string | null;
    }>;
    remove(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private normalizeType;
    private normalizeRating;
    private normalizeRevenue;
    private normalizeEmployees;
    private nullableTrim;
    private assertAccountBelongsToTenant;
    private assertOwnerBelongsToTenant;
    private recordAudit;
}
