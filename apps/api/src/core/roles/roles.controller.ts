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
import { RequirePermission } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RolesService, type CreateRoleBody } from './roles.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  @RequirePermission('roles.manage')
  list() {
    return this.roles.listRoles();
  }

  @Post()
  @RequirePermission('roles.manage')
  create(@Body() body: CreateRoleBody) {
    return this.roles.createRole({ ...body });
  }

  @Patch(':id')
  @RequirePermission('roles.manage')
  update(
    @Param('id') id: string,
    @Body()
    body: { name?: string; description?: string; permissionKeys?: string[] },
  ) {
    return this.roles.updateRole(id, body);
  }

  @Delete(':id')
  @RequirePermission('roles.manage')
  remove(@Param('id') id: string) {
    return this.roles.deleteRole(id);
  }
}
