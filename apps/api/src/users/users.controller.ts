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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { UsersService, type InviteUserBody } from './users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles('Owner', 'Admin')
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.users.listUsers();
  }

  @Post('invite')
  @Roles('Owner', 'Admin')
  invite(@CurrentUser() user: AuthenticatedUser, @Body() body: InviteUserBody) {
    return this.users.inviteUser({ ...body });
  }

  @Patch(':id/role')
  @Roles('Owner', 'Admin')
  updateRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: { roleId: string },
  ) {
    return this.users.updateUserRole(id, body.roleId);
  }

  @Delete(':id')
  @Roles('Owner', 'Admin')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.users.deleteUser(id);
  }
}
