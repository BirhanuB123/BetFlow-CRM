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
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        phone: string | null;
        accountId: string | null;
        title: string | null;
    })[]>;
    get(tenantId: string, id: string): Promise<{
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
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        phone: string | null;
        accountId: string | null;
        title: string | null;
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
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        phone: string | null;
        accountId: string | null;
        title: string | null;
    }>;
    remove(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private assertAccountBelongsToTenant;
    private recordAudit;
}
