import { AccountsService } from './accounts.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateAccountInput, UpdateAccountInput } from './accounts.types';
export declare class AccountsController {
    private readonly accounts;
    constructor(accounts: AccountsService);
    list(user: AuthenticatedUser): import("@prisma/client").Prisma.PrismaPromise<({
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
            deals: number;
            customers: number;
        };
    } & {
        id: string;
        email: string | null;
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
        annualRevenue: import("@prisma/client-runtime-utils").Decimal | null;
        employees: number | null;
        parentAccountId: string | null;
        ownerId: string | null;
    })[]>;
    get(user: AuthenticatedUser, id: string): Promise<{
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
            value: import("@prisma/client-runtime-utils").Decimal;
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
        _count: {
            deals: number;
            customers: number;
        };
    } & {
        id: string;
        email: string | null;
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
        annualRevenue: import("@prisma/client-runtime-utils").Decimal | null;
        employees: number | null;
        parentAccountId: string | null;
        ownerId: string | null;
    }>;
    create(user: AuthenticatedUser, body: CreateAccountInput): Promise<{
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
            deals: number;
            customers: number;
        };
    } & {
        id: string;
        email: string | null;
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
        annualRevenue: import("@prisma/client-runtime-utils").Decimal | null;
        employees: number | null;
        parentAccountId: string | null;
        ownerId: string | null;
    }>;
    update(user: AuthenticatedUser, id: string, body: UpdateAccountInput): Promise<{
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
            deals: number;
            customers: number;
        };
    } & {
        id: string;
        email: string | null;
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
        annualRevenue: import("@prisma/client-runtime-utils").Decimal | null;
        employees: number | null;
        parentAccountId: string | null;
        ownerId: string | null;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
