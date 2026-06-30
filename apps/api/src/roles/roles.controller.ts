import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InMemoryService, Role } from '../database/in-memory.service';

type CreateRoleBody = Omit<Role, 'id'>;

@Controller('roles')
export class RolesController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string) {
    return this.store.listRoles(tenantId);
  }

  @Post()
  create(@Body() body: CreateRoleBody) {
    return this.store.createRole(body);
  }
}
