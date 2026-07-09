import { CustomersService } from './customers.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateCustomerInput, UpdateCustomerInput } from './customers.types';
export declare class CustomersController {
    private readonly customers;
    constructor(customers: CustomersService);
    list(user: AuthenticatedUser): import("@prisma/client").Prisma.PrismaPromise<({
        account: {
            id: string;
            name: string;
        } | null;
        _count: {
            deals: number;
            reservations: number;
            contracts: number;
        };
    } & {
        id: string;
        tenantId: string;
        accountId: string | null;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        title: string | null;
        createdAt: Date;
    })[]>;
    get(user: AuthenticatedUser, id: string): Promise<{
        payments: {
            id: string;
            status: string;
            amount: import("@prisma/client-runtime-utils").Decimal;
            date: Date;
            method: string;
            contractId: string | null;
            reservationId: string | null;
        }[];
        account: {
            id: string;
            name: string;
        } | null;
        deals: {
            id: string;
            createdAt: Date;
            name: string;
            value: import("@prisma/client-runtime-utils").Decimal;
            stage: {
                id: string;
                name: string;
                probability: number;
            };
            unit: {
                id: string;
                unitNumber: string;
            } | null;
        }[];
        reservations: {
            id: string;
            unit: {
                id: string;
                unitNumber: string;
            };
            status: string;
            amount: import("@prisma/client-runtime-utils").Decimal;
            date: Date;
        }[];
        contracts: {
            id: string;
            unit: {
                id: string;
                unitNumber: string;
            };
            status: string;
            startDate: Date;
            totalAmt: import("@prisma/client-runtime-utils").Decimal;
        }[];
        id: string;
        tenantId: string;
        accountId: string | null;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        title: string | null;
        createdAt: Date;
    }>;
    create(user: AuthenticatedUser, body: CreateCustomerInput): Promise<{
        account: {
            id: string;
            name: string;
        } | null;
        _count: {
            deals: number;
            reservations: number;
            contracts: number;
        };
    } & {
        id: string;
        tenantId: string;
        accountId: string | null;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        title: string | null;
        createdAt: Date;
    }>;
    update(user: AuthenticatedUser, id: string, body: UpdateCustomerInput): Promise<{
        account: {
            id: string;
            name: string;
        } | null;
        _count: {
            deals: number;
            reservations: number;
            contracts: number;
        };
    } & {
        id: string;
        tenantId: string;
        accountId: string | null;
        firstName: string;
        lastName: string;
        email: string | null;
        phone: string | null;
        title: string | null;
        createdAt: Date;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
