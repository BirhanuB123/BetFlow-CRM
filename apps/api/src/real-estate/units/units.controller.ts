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
import { UnitsService } from './units.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import type {
  CreateUnitInput,
  UpdateUnitInput,
  UpdateUnitStatusInput,
} from './units.types';

@UseGuards(JwtAuthGuard)
@Controller('units')
export class UnitsController {
  constructor(private readonly units: UnitsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: string,
    @Query('floorId') floorId?: string,
  ) {
    return this.units.list({ status, floorId });
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.units.get(id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateUnitInput,
  ) {
    return this.units.create(user.id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateUnitStatusInput,
  ) {
    return this.units.updateStatus(user.id, id, body.status);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateUnitInput,
  ) {
    return this.units.update(user.id, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.units.remove(user.id, id);
  }
}
