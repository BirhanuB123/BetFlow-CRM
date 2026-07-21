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
import { RolesService, type CreateRoleBody } from './roles.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  @Roles('Owner', 'Admin')
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.roles.listRoles();
  }

  @Post()
  @Roles('Owner', 'Admin')
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateRoleBody) {
    return this.roles.createRole({ ...body });
  }

  @Patch(':id')
  @Roles('Owner', 'Admin')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: { name: string; description?: string },
  ) {
    return this.roles.updateRole(id, body);
  }

  @Delete(':id')
  @Roles('Owner', 'Admin')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.roles.deleteRole(id);
  }
}
