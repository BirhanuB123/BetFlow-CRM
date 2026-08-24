import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DealsService } from './deals.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import type {
  CreateDealInput,
  MoveDealStageInput,
  UpdateDealInput,
} from './deals.types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Owner', 'Admin', 'Sales Manager', 'Agent', 'Finance')
@Controller('deals')
export class DealsController {
  constructor(private readonly deals: DealsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.deals.list();
  }

  @Get('stages')
  stages(@CurrentUser() user: AuthenticatedUser) {
    return this.deals.listStages();
  }

  @Post()
  @Roles('Owner', 'Admin', 'Sales Manager', 'Agent')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateDealInput,
  ) {
    return this.deals.create(user.id, body);
  }

  @Patch(':id/stage')
  @Roles('Owner', 'Admin', 'Sales Manager', 'Agent')
  moveStage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: MoveDealStageInput,
  ) {
    return this.deals.moveStage(user.id, id, body.stageId);
  }

  @Patch(':id')
  @Roles('Owner', 'Admin', 'Sales Manager', 'Agent')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateDealInput,
  ) {
    return this.deals.update(user.id, id, body);
  }

  @Delete(':id')
  @Roles('Owner', 'Admin', 'Sales Manager')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.deals.remove(user.id, id);
  }
}
