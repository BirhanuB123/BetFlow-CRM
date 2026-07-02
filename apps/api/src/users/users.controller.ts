import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { UsersService } from './users.service';
import type { InviteUserBody } from './users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles('Owner', 'Admin')
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.users.listUsers(user.tenantId);
  }

  @Post('invite')
  @Roles('Owner', 'Admin')
  invite(@CurrentUser() user: AuthenticatedUser, @Body() body: InviteUserBody) {
    return this.users.inviteUser({ ...body, tenantId: user.tenantId });
  }
}
