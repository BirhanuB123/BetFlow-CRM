import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InMemoryService } from '../database/in-memory.service';
import type { SiteVisit } from '../database/in-memory.service';

type CreateSiteVisitBody = Omit<SiteVisit, 'id'>;

@Controller('site-visits')
export class SiteVisitsController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string) {
    return this.store.listSiteVisits(tenantId);
  }

  @Post()
  create(@Body() body: CreateSiteVisitBody) {
    return this.store.createSiteVisit(body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: SiteVisit['status'],
    @Body('outcome') outcome?: string,
  ) {
    return this.store.updateSiteVisitStatus(id, status, outcome);
  }
}
