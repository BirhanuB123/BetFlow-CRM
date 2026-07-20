import { PropertiesService } from './properties.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateBuildingInput, CreateFloorInput, UpdateBuildingInput, UpdateFloorInput } from './properties.types';
export declare class PropertiesController {
    private readonly properties;
    constructor(properties: PropertiesService);
    listBuildings(user: AuthenticatedUser, projectId?: string): Promise<{
        unitsCount: number;
        project: {
            id: string;
            name: string;
        };
        _count: {
            floors: number;
        };
        id: string;
        name: string;
        projectId: string;
        floorsCount: number;
    }[]>;
    getBuilding(user: AuthenticatedUser, id: string): Promise<{
        project: {
            id: string;
            name: string;
        };
        floors: ({
            _count: {
                units: number;
            };
        } & {
            id: string;
            name: string | null;
            buildingId: string;
            floorNumber: number;
        })[];
    } & {
        id: string;
        name: string;
        projectId: string;
        floorsCount: number;
    }>;
    createBuilding(user: AuthenticatedUser, body: CreateBuildingInput): Promise<{
        project: {
            id: string;
            name: string;
        };
        _count: {
            floors: number;
        };
    } & {
        id: string;
        name: string;
        projectId: string;
        floorsCount: number;
    }>;
    updateBuilding(user: AuthenticatedUser, id: string, body: UpdateBuildingInput): Promise<{
        project: {
            id: string;
            name: string;
        };
        _count: {
            floors: number;
        };
    } & {
        id: string;
        name: string;
        projectId: string;
        floorsCount: number;
    }>;
    removeBuilding(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    listFloors(user: AuthenticatedUser, buildingId?: string): import("@prisma/client").Prisma.PrismaPromise<({
        building: {
            id: string;
            name: string;
        };
        _count: {
            units: number;
        };
    } & {
        id: string;
        name: string | null;
        buildingId: string;
        floorNumber: number;
    })[]>;
    createFloor(user: AuthenticatedUser, body: CreateFloorInput): Promise<{
        building: {
            id: string;
            name: string;
        };
        _count: {
            units: number;
        };
    } & {
        id: string;
        name: string | null;
        buildingId: string;
        floorNumber: number;
    }>;
    updateFloor(user: AuthenticatedUser, id: string, body: UpdateFloorInput): Promise<{
        building: {
            id: string;
            name: string;
        };
        _count: {
            units: number;
        };
    } & {
        id: string;
        name: string | null;
        buildingId: string;
        floorNumber: number;
    }>;
    removeFloor(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
