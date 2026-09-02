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
import { UsersService, type InviteUserBody } from './users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @RequirePermission('users.manage')
  list() {
    return this.users.listUsers();
  }

  @Post('invite')
  @RequirePermission('users.manage')
  invite(@Body() body: InviteUserBody) {
    return this.users.inviteUser({ ...body });
  }

  @Patch(':id/status')
  @RequirePermission('users.manage')
  updateStatus(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.users.updateUserStatus(id, body.isActive);
  }

  @Patch(':id/role')
  @RequirePermission('users.manage')
  updateRole(@Param('id') id: string, @Body() body: { roleId: string }) {
    return this.users.updateUserRole(id, body.roleId);
  }

  @Delete(':id')
  @RequirePermission('users.manage')
  remove(@Param('id') id: string) {
    return this.users.deleteUser(id);
  }
}
