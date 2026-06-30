import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InMemoryService } from '../database/in-memory.service';
import type { Project } from '../database/in-memory.service';

type CreateProjectBody = Omit<Project, 'id'>;

@Controller('projects')
export class ProjectsController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string) {
    return this.store.listProjects(tenantId);
  }

  @Post()
  create(@Body() body: CreateProjectBody) {
    return this.store.createProject(body);
  }
}
