import { InMemoryService } from '../database/in-memory.service';
import type { Building, Floor, PropertyMedia } from '../database/in-memory.service';
type CreateBuildingBody = Omit<Building, 'id'>;
type CreateFloorBody = Omit<Floor, 'id'>;
type CreatePropertyMediaBody = Omit<PropertyMedia, 'id' | 'updatedAt'>;
export declare class PropertiesController {
    private readonly store;
    constructor(store: InMemoryService);
    listBuildings(tenantId?: string, projectId?: string): Building[];
    createBuilding(body: CreateBuildingBody): Building;
    listFloors(tenantId?: string, buildingId?: string): Floor[];
    createFloor(body: CreateFloorBody): Floor;
    listMedia(tenantId?: string, projectId?: string): PropertyMedia[];
    createMedia(body: CreatePropertyMediaBody): PropertyMedia;
}
export {};
