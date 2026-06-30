import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Activity, InMemoryService } from '../database/in-memory.service';

type CreateActivityBody = Omit<Activity, 'id' | 'createdAt'>;

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string) {
    return this.store.listActivities(tenantId);
  }

  @Post()
  create(@Body() body: CreateActivityBody) {
    return this.store.recordActivity(body);
  }
}
