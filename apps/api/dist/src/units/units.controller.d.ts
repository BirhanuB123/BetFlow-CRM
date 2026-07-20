import { UnitsService } from './units.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateUnitInput, UpdateUnitInput, UpdateUnitStatusInput } from './units.types';
export declare class UnitsController {
    private readonly units;
    constructor(units: UnitsService);
    list(user: AuthenticatedUser, status?: string, floorId?: string): import("@prisma/client").Prisma.PrismaPromise<({
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
        status: string;
        unitNumber: string;
        type: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        area: number | null;
        floorId: string;
    })[]>;
    get(user: AuthenticatedUser, id: string): Promise<{
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
        status: string;
        unitNumber: string;
        type: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        area: number | null;
        floorId: string;
    }>;
    create(user: AuthenticatedUser, body: CreateUnitInput): Promise<{
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
        status: string;
        unitNumber: string;
        type: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        area: number | null;
        floorId: string;
    }>;
    updateStatus(user: AuthenticatedUser, id: string, body: UpdateUnitStatusInput): Promise<{
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
        status: string;
        unitNumber: string;
        type: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        area: number | null;
        floorId: string;
    }>;
    update(user: AuthenticatedUser, id: string, body: UpdateUnitInput): Promise<{
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
        status: string;
        unitNumber: string;
        type: string;
        price: import("@prisma/client-runtime-utils").Decimal;
        area: number | null;
        floorId: string;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
