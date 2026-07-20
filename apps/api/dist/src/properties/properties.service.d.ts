import { PrismaService } from '../database/prisma.service';
import { CreateBuildingInput, CreateFloorInput, UpdateBuildingInput, UpdateFloorInput } from './properties.types';
export declare class PropertiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listBuildings(projectId?: string): Promise<{
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
    getBuilding(id: string): Promise<{
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
    createBuilding(userId: string, input: CreateBuildingInput): Promise<{
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
    updateBuilding(userId: string, id: string, input: UpdateBuildingInput): Promise<{
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
    removeBuilding(userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    listFloors(buildingId?: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    createFloor(userId: string, input: CreateFloorInput): Promise<{
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
    updateFloor(userId: string, id: string, input: UpdateFloorInput): Promise<{
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
    removeFloor(userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private normalizeCount;
    private assertProjectBelongsToTenant;
    private assertBuildingBelongsToTenant;
    private recordAudit;
}
