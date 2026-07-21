import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import type {
  CreateBuildingInput,
  CreateFloorInput,
  UpdateBuildingInput,
  UpdateFloorInput,
} from './properties.types';

@UseGuards(JwtAuthGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly properties: PropertiesService) {}

  // ---- Buildings ----
  @Get('buildings')
  listBuildings(
    @CurrentUser() user: AuthenticatedUser,
    @Query('projectId') projectId?: string,
  ) {
    return this.properties.listBuildings(projectId);
  }

  @Get('buildings/:id')
  getBuilding(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.properties.getBuilding(id);
  }

  @Post('buildings')
  createBuilding(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateBuildingInput,
  ) {
    return this.properties.createBuilding(user.id, body);
  }

  @Patch('buildings/:id')
  updateBuilding(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateBuildingInput,
  ) {
    return this.properties.updateBuilding(user.id, id, body);
  }

  @Delete('buildings/:id')
  removeBuilding(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.properties.removeBuilding(user.id, id);
  }

  // ---- Floors ----
  @Get('floors')
  listFloors(
    @CurrentUser() user: AuthenticatedUser,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.properties.listFloors(buildingId);
  }

  @Post('floors')
  createFloor(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateFloorInput,
  ) {
    return this.properties.createFloor(user.id, body);
  }

  @Patch('floors/:id')
  updateFloor(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateFloorInput,
  ) {
    return this.properties.updateFloor(user.id, id, body);
  }

  @Delete('floors/:id')
  removeFloor(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.properties.removeFloor(user.id, id);
  }
}
