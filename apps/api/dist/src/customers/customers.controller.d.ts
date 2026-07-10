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
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        phone: string | null;
        accountId: string | null;
        title: string | null;
    })[]>;
    get(user: AuthenticatedUser, id: string): Promise<{
        payments: {
            id: string;
            status: string;
            date: Date;
            amount: import("@prisma/client-runtime-utils").Decimal;
            method: string;
            contractId: string | null;
            reservationId: string | null;
        }[];
        deals: {
            id: string;
            createdAt: Date;
            name: string;
            unit: {
                id: string;
                unitNumber: string;
            } | null;
            value: import("@prisma/client-runtime-utils").Decimal;
            stage: {
                id: string;
                name: string;
                probability: number;
            };
        }[];
        reservations: {
            id: string;
            status: string;
            unit: {
                id: string;
                unitNumber: string;
            };
            date: Date;
            amount: import("@prisma/client-runtime-utils").Decimal;
        }[];
        contracts: {
            id: string;
            startDate: Date;
            status: string;
            unit: {
                id: string;
                unitNumber: string;
            };
            totalAmt: import("@prisma/client-runtime-utils").Decimal;
        }[];
        account: {
            id: string;
            name: string;
        } | null;
        id: string;
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        phone: string | null;
        accountId: string | null;
        title: string | null;
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
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        phone: string | null;
        accountId: string | null;
        title: string | null;
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
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        phone: string | null;
        accountId: string | null;
        title: string | null;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
