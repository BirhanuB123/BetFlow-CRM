import { PrismaService } from '../database/prisma.service';
import { CreateContractInput, UpdateContractInput } from './contracts.types';
export declare class ContractsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string): import("@prisma/client").Prisma.PrismaPromise<({
        unit: {
            id: string;
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
    get(tenantId: string, id: string): Promise<{
        unit: {
            id: string;
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
    create(tenantId: string, userId: string, input: CreateContractInput): Promise<{
        unit: {
            id: string;
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
    update(tenantId: string, userId: string, id: string, input: UpdateContractInput): Promise<{
        unit: {
            id: string;
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
    remove(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private normalizeAmount;
    private normalizeDate;
    private assertCustomerBelongsToTenant;
    private assertUnitBelongsToTenant;
    private assertDealBelongsToTenant;
    private recordAudit;
}
