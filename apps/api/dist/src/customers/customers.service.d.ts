import { PrismaService } from '../database/prisma.service';
import { CreateCustomerInput, UpdateCustomerInput } from './customers.types';
export declare class CustomersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): import("@prisma/client").Prisma.PrismaPromise<({
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
        firstName: string;
        lastName: string;
        createdAt: Date;
        phone: string | null;
        accountId: string | null;
        title: string | null;
    })[]>;
    get(id: string): Promise<{
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
            status: string;
            unit: {
                id: string;
                unitNumber: string;
            };
            startDate: Date;
            totalAmt: import("@prisma/client-runtime-utils").Decimal;
        }[];
        account: {
            id: string;
            name: string;
        } | null;
        id: string;
        email: string | null;
        firstName: string;
        lastName: string;
        createdAt: Date;
        phone: string | null;
        accountId: string | null;
        title: string | null;
    }>;
    create(userId: string, input: CreateCustomerInput): Promise<{
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
        firstName: string;
        lastName: string;
        createdAt: Date;
        phone: string | null;
        accountId: string | null;
        title: string | null;
    }>;
    update(userId: string, id: string, input: UpdateCustomerInput): Promise<{
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
        firstName: string;
        lastName: string;
        createdAt: Date;
        phone: string | null;
        accountId: string | null;
        title: string | null;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private assertAccountBelongsToTenant;
    private recordAudit;
}
