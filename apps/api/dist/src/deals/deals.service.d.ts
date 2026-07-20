import { PrismaService } from '../database/prisma.service';
import { CreateDealInput, UpdateDealInput } from './deals.types';
export declare class DealsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): import("@prisma/client").Prisma.PrismaPromise<({
        unit: {
            id: string;
            unitNumber: string;
            type: string;
        } | null;
        account: {
            id: string;
            name: string;
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
        createdAt: Date;
        name: string;
        accountId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        stageId: string;
        customerId: string;
        unitId: string | null;
    })[]>;
    listStages(): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        order: number;
        probability: number;
    }[]>;
    create(userId: string, input: CreateDealInput): Promise<{
        unit: {
            id: string;
            unitNumber: string;
            type: string;
        } | null;
        account: {
            id: string;
            name: string;
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
        createdAt: Date;
        name: string;
        accountId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        stageId: string;
        customerId: string;
        unitId: string | null;
    }>;
    update(userId: string, id: string, input: UpdateDealInput): Promise<{
        unit: {
            id: string;
            unitNumber: string;
            type: string;
        } | null;
        account: {
            id: string;
            name: string;
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
        createdAt: Date;
        name: string;
        accountId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        stageId: string;
        customerId: string;
        unitId: string | null;
    }>;
    moveStage(userId: string, id: string, stageId: string): Promise<{
        unit: {
            id: string;
            unitNumber: string;
            type: string;
        } | null;
        account: {
            id: string;
            name: string;
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
        createdAt: Date;
        name: string;
        accountId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        stageId: string;
        customerId: string;
        unitId: string | null;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private normalizeValue;
    private assertStageBelongsToTenant;
    private assertCustomerBelongsToTenant;
    private assertAccountBelongsToTenant;
    private assertUnitBelongsToTenant;
    private recordAudit;
}
