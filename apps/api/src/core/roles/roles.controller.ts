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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import { RolesService, type CreateRoleBody } from './roles.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  @RequirePermission('roles.manage')
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.roles.listRoles();
  }

  @Post()
  @RequirePermission('roles.manage')
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateRoleBody) {
    return this.roles.createRole({ ...body });
  }

  @Patch(':id')
  @RequirePermission('roles.manage')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body()
    body: { name?: string; description?: string; permissionKeys?: string[] },
  ) {
    return this.roles.updateRole(id, body);
  }

  @Delete(':id')
  @RequirePermission('roles.manage')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.roles.deleteRole(id);
  }
}
