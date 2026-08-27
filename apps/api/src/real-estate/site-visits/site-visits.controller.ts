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
import { SiteVisitsService } from './site-visits.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission, Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import type {
  CreateSiteVisitInput,
  UpdateSiteVisitInput,
  UpdateSiteVisitStatusInput,
} from './site-visits.types';

@UseGuards(JwtAuthGuard, RolesGuard)
@RequirePermission('site-visits.manage')
@Roles('Owner', 'Admin', 'Sales Manager', 'Agent')
@Controller('site-visits')
export class SiteVisitsController {
  constructor(private readonly siteVisits: SiteVisitsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.siteVisits.list({
      status,
      upcoming: upcoming === 'true' || upcoming === '1',
    });
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.siteVisits.get(id);
  }

  @Get(':id/recommended-units')
  async recommendedUnits(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const visit = await this.siteVisits.get(id);
    return this.siteVisits.calculateUnitRecommendations(visit);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateSiteVisitInput,
  ) {
    return this.siteVisits.create(user.id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateSiteVisitStatusInput,
  ) {
    return this.siteVisits.updateStatus(user.id, id, body.status);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateSiteVisitInput,
  ) {
    return this.siteVisits.update(user.id, id, body);
  }

  @Delete(':id')
  @Roles('Owner', 'Admin', 'Sales Manager')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.siteVisits.remove(user.id, id);
  }
}
