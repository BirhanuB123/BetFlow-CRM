import { PrismaService } from '../database/prisma.service';
import { CreateDealInput, UpdateDealInput } from './deals.types';
export declare class DealsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string): import("@prisma/client").Prisma.PrismaPromise<({
        unit: {
            id: string;
            unitNumber: string;
            type: string;
        } | null;
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        };
        stage: {
            id: string;
            name: string;
            order: number;
            probability: number;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        value: import("@prisma/client-runtime-utils").Decimal;
        stageId: string;
        customerId: string;
        unitId: string | null;
    })[]>;
    listStages(tenantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        order: number;
        probability: number;
    }[]>;
    create(tenantId: string, userId: string, input: CreateDealInput): Promise<{
        unit: {
            id: string;
            unitNumber: string;
            type: string;
        } | null;
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        };
        stage: {
            id: string;
            name: string;
            order: number;
            probability: number;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        value: import("@prisma/client-runtime-utils").Decimal;
        stageId: string;
        customerId: string;
        unitId: string | null;
    }>;
    update(tenantId: string, userId: string, id: string, input: UpdateDealInput): Promise<{
        unit: {
            id: string;
            unitNumber: string;
            type: string;
        } | null;
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        };
        stage: {
            id: string;
            name: string;
            order: number;
            probability: number;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        value: import("@prisma/client-runtime-utils").Decimal;
        stageId: string;
        customerId: string;
        unitId: string | null;
    }>;
    moveStage(tenantId: string, userId: string, id: string, stageId: string): Promise<{
        unit: {
            id: string;
            unitNumber: string;
            type: string;
        } | null;
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        };
        stage: {
            id: string;
            name: string;
            order: number;
            probability: number;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        value: import("@prisma/client-runtime-utils").Decimal;
        stageId: string;
        customerId: string;
        unitId: string | null;
    }>;
    remove(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private normalizeValue;
    private assertStageBelongsToTenant;
    private assertCustomerBelongsToTenant;
    private assertUnitBelongsToTenant;
    private recordAudit;
}
