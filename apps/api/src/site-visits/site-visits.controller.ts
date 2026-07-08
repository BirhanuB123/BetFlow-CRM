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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import type {
  CreateSiteVisitInput,
  UpdateSiteVisitInput,
  UpdateSiteVisitStatusInput,
} from './site-visits.types';

@UseGuards(JwtAuthGuard)
@Controller('site-visits')
export class SiteVisitsController {
  constructor(private readonly siteVisits: SiteVisitsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.siteVisits.list(user.tenantId, {
      status,
      upcoming: upcoming === 'true' || upcoming === '1',
    });
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.siteVisits.get(user.tenantId, id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateSiteVisitInput,
  ) {
    return this.siteVisits.create(user.tenantId, user.id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateSiteVisitStatusInput,
  ) {
    return this.siteVisits.updateStatus(user.tenantId, user.id, id, body.status);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateSiteVisitInput,
  ) {
    return this.siteVisits.update(user.tenantId, user.id, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.siteVisits.remove(user.tenantId, user.id, id);
  }
}
