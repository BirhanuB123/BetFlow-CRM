import { PrismaService } from '../database/prisma.service';
import { CreateUnitInput, UpdateUnitInput } from './units.types';
export declare class UnitsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string, filters?: {
        status?: string;
        floorId?: string;
    }): import("@prisma/client").Prisma.PrismaPromise<({
        floor: {
            id: string;
            name: string | null;
            building: {
                id: string;
                name: string;
                project: {
                    id: string;
                    name: string;
                };
            };
            floorNumber: number;
        };
        _count: {
            deals: number;
            reservations: number;
            contracts: number;
        };
    } & {
        id: string;
        tenantId: string;
        status: string;
        unitNumber: string;
        type: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        area: number | null;
        floorId: string;
    })[]>;
    get(tenantId: string, id: string): Promise<{
        floor: {
            id: string;
            name: string | null;
            building: {
                id: string;
                name: string;
                project: {
                    id: string;
                    name: string;
                };
            };
            floorNumber: number;
        };
        _count: {
            deals: number;
            reservations: number;
            contracts: number;
        };
    } & {
        id: string;
        tenantId: string;
        status: string;
        unitNumber: string;
        type: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        area: number | null;
        floorId: string;
    }>;
    create(tenantId: string, userId: string, input: CreateUnitInput): Promise<{
        floor: {
            id: string;
            name: string | null;
            building: {
                id: string;
                name: string;
                project: {
                    id: string;
                    name: string;
                };
            };
            floorNumber: number;
        };
        _count: {
            deals: number;
            reservations: number;
            contracts: number;
        };
    } & {
        id: string;
        tenantId: string;
        status: string;
        unitNumber: string;
        type: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        area: number | null;
        floorId: string;
    }>;
    update(tenantId: string, userId: string, id: string, input: UpdateUnitInput): Promise<{
        floor: {
            id: string;
            name: string | null;
            building: {
                id: string;
                name: string;
                project: {
                    id: string;
                    name: string;
                };
            };
            floorNumber: number;
        };
        _count: {
            deals: number;
            reservations: number;
            contracts: number;
        };
    } & {
        id: string;
        tenantId: string;
        status: string;
        unitNumber: string;
        type: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        area: number | null;
        floorId: string;
    }>;
    updateStatus(tenantId: string, userId: string, id: string, status: string): Promise<{
        floor: {
            id: string;
            name: string | null;
            building: {
                id: string;
                name: string;
                project: {
                    id: string;
                    name: string;
                };
            };
            floorNumber: number;
        };
        _count: {
            deals: number;
            reservations: number;
            contracts: number;
        };
    } & {
        id: string;
        tenantId: string;
        status: string;
        unitNumber: string;
        type: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        area: number | null;
        floorId: string;
    }>;
    remove(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private normalizeStatus;
    private normalizePrice;
    private assertFloorBelongsToTenant;
    private recordAudit;
}
