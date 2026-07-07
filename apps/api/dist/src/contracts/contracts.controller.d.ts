import { ContractsService } from './contracts.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateContractInput, UpdateContractInput } from './contracts.types';
export declare class ContractsController {
    private readonly contracts;
    constructor(contracts: ContractsService);
    list(user: AuthenticatedUser): import("@prisma/client").Prisma.PrismaPromise<({
        unit: {
            id: string;
            status: string;
            unitNumber: string;
            type: string;
        };
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        };
        deal: {
            id: string;
            name: string;
        } | null;
        _count: {
            payments: number;
            schedules: number;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        startDate: Date;
        endDate: Date | null;
        status: string;
        customerId: string;
        unitId: string;
        dealId: string | null;
        totalAmt: import("@prisma/client-runtime-utils").Decimal;
    })[]>;
    get(user: AuthenticatedUser, id: string): Promise<{
        unit: {
            id: string;
            status: string;
            unitNumber: string;
            type: string;
        };
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        };
        deal: {
            id: string;
            name: string;
        } | null;
        _count: {
            payments: number;
            schedules: number;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        startDate: Date;
        endDate: Date | null;
        status: string;
        customerId: string;
        unitId: string;
        dealId: string | null;
        totalAmt: import("@prisma/client-runtime-utils").Decimal;
    }>;
    create(user: AuthenticatedUser, body: CreateContractInput): Promise<{
        unit: {
            id: string;
            status: string;
            unitNumber: string;
            type: string;
        };
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        };
        deal: {
            id: string;
            name: string;
        } | null;
        _count: {
            payments: number;
            schedules: number;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        startDate: Date;
        endDate: Date | null;
        status: string;
        customerId: string;
        unitId: string;
        dealId: string | null;
        totalAmt: import("@prisma/client-runtime-utils").Decimal;
    }>;
    update(user: AuthenticatedUser, id: string, body: UpdateContractInput): Promise<{
        unit: {
            id: string;
            status: string;
            unitNumber: string;
            type: string;
        };
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        };
        deal: {
            id: string;
            name: string;
        } | null;
        _count: {
            payments: number;
            schedules: number;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        startDate: Date;
        endDate: Date | null;
        status: string;
        customerId: string;
        unitId: string;
        dealId: string | null;
        totalAmt: import("@prisma/client-runtime-utils").Decimal;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
