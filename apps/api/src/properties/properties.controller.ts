import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InMemoryService } from '../database/in-memory.service';
import type {
  Building,
  Floor,
  PropertyMedia,
} from '../database/in-memory.service';

type CreateBuildingBody = Omit<Building, 'id'>;
type CreateFloorBody = Omit<Floor, 'id'>;
type CreatePropertyMediaBody = Omit<PropertyMedia, 'id' | 'updatedAt'>;

@Controller('properties')
export class PropertiesController {
  constructor(private readonly store: InMemoryService) {}

  @Get('buildings')
  listBuildings(
    @Query('tenantId') tenantId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.store.listBuildings(tenantId, projectId);
  }

  @Post('buildings')
  createBuilding(@Body() body: CreateBuildingBody) {
    return this.store.createBuilding(body);
  }

  @Get('floors')
  listFloors(
    @Query('tenantId') tenantId?: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.store.listFloors(tenantId, buildingId);
  }

  @Post('floors')
  createFloor(@Body() body: CreateFloorBody) {
    return this.store.createFloor(body);
  }

  @Get('media')
  listMedia(
    @Query('tenantId') tenantId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.store.listPropertyMedia(tenantId, projectId);
  }

  @Post('media')
  createMedia(@Body() body: CreatePropertyMediaBody) {
    return this.store.createPropertyMedia(body);
  }
}
