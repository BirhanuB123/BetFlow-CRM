import { PrismaService } from '../database/prisma.service';
import { CreateCustomerInput, UpdateCustomerInput } from './customers.types';
export declare class CustomersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    get(tenantId: string, id: string): Promise<{
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
    create(tenantId: string, userId: string, input: CreateCustomerInput): Promise<{
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
    update(tenantId: string, userId: string, id: string, input: UpdateCustomerInput): Promise<{
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
    remove(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private assertAccountBelongsToTenant;
    private recordAudit;
}
