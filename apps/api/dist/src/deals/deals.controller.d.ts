import { DealsService } from './deals.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateDealInput, MoveDealStageInput, UpdateDealInput } from './deals.types';
export declare class DealsController {
    private readonly deals;
    constructor(deals: DealsService);
    list(user: AuthenticatedUser): import("@prisma/client").Prisma.PrismaPromise<({
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
        tenantId: string;
        createdAt: Date;
        name: string;
        accountId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        stageId: string;
        customerId: string;
        unitId: string | null;
    })[]>;
    stages(user: AuthenticatedUser): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        order: number;
        probability: number;
    }[]>;
    create(user: AuthenticatedUser, body: CreateDealInput): Promise<{
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
        tenantId: string;
        createdAt: Date;
        name: string;
        accountId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        stageId: string;
        customerId: string;
        unitId: string | null;
    }>;
    moveStage(user: AuthenticatedUser, id: string, body: MoveDealStageInput): Promise<{
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
        tenantId: string;
        createdAt: Date;
        name: string;
        accountId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        stageId: string;
        customerId: string;
        unitId: string | null;
    }>;
    update(user: AuthenticatedUser, id: string, body: UpdateDealInput): Promise<{
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
        tenantId: string;
        createdAt: Date;
        name: string;
        accountId: string | null;
        value: import("@prisma/client-runtime-utils").Decimal;
        stageId: string;
        customerId: string;
        unitId: string | null;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
