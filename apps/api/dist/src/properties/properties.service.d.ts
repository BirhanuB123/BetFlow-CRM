import { PrismaService } from '../database/prisma.service';
import { CreateBuildingInput, CreateFloorInput, UpdateBuildingInput, UpdateFloorInput } from './properties.types';
export declare class PropertiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listBuildings(tenantId: string, projectId?: string): Promise<{
        unitsCount: number;
        project: {
            id: string;
            name: string;
        };
        _count: {
            floors: number;
        };
        id: string;
        tenantId: string;
        name: string;
        projectId: string;
        floorsCount: number;
    }[]>;
    getBuilding(tenantId: string, id: string): Promise<{
        floors: ({
            _count: {
                units: number;
            };
        } & {
            id: string;
            tenantId: string;
            name: string | null;
            buildingId: string;
            floorNumber: number;
        })[];
        project: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        tenantId: string;
        name: string;
        projectId: string;
        floorsCount: number;
    }>;
    createBuilding(tenantId: string, userId: string, input: CreateBuildingInput): Promise<{
        project: {
            id: string;
            name: string;
        };
        _count: {
            floors: number;
        };
    } & {
        id: string;
        tenantId: string;
        name: string;
        projectId: string;
        floorsCount: number;
    }>;
    updateBuilding(tenantId: string, userId: string, id: string, input: UpdateBuildingInput): Promise<{
        project: {
            id: string;
            name: string;
        };
        _count: {
            floors: number;
        };
    } & {
        id: string;
        tenantId: string;
        name: string;
        projectId: string;
        floorsCount: number;
    }>;
    removeBuilding(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    listFloors(tenantId: string, buildingId?: string): import("@prisma/client").Prisma.PrismaPromise<({
        building: {
            id: string;
            name: string;
        };
        _count: {
            units: number;
        };
    } & {
        id: string;
        tenantId: string;
        name: string | null;
        buildingId: string;
        floorNumber: number;
    })[]>;
    createFloor(tenantId: string, userId: string, input: CreateFloorInput): Promise<{
        building: {
            id: string;
            name: string;
        };
        _count: {
            units: number;
        };
    } & {
        id: string;
        tenantId: string;
        name: string | null;
        buildingId: string;
        floorNumber: number;
    }>;
    updateFloor(tenantId: string, userId: string, id: string, input: UpdateFloorInput): Promise<{
        building: {
            id: string;
            name: string;
        };
        _count: {
            units: number;
        };
    } & {
        id: string;
        tenantId: string;
        name: string | null;
        buildingId: string;
        floorNumber: number;
    }>;
    removeFloor(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private normalizeCount;
    private assertProjectBelongsToTenant;
    private assertBuildingBelongsToTenant;
    private recordAudit;
}
