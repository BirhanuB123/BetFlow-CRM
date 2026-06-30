import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InMemoryService } from '../database/in-memory.service';

type InviteUserBody = {
  tenantId: string;
  name: string;
  email: string;
  roleId: string;
};

@Controller('users')
export class UsersController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string) {
    return this.store.listUsers(tenantId);
  }

  @Post('invite')
  invite(@Body() body: InviteUserBody) {
    return this.store.inviteUser(body);
  }
}
