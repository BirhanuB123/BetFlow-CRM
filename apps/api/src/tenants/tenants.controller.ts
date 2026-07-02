import {
  Body,
  Controller,
  ForbiddenException,
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
import { TenantsService } from './tenants.service';
import type { RegisterTenantBody, UpdateTenantBody } from './tenants.service';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenants: TenantsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Owner', 'Admin')
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.tenants.getTenant(user.tenantId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    if (id !== user.tenantId) {
      throw new ForbiddenException('Tenant access denied');
    }

    return this.tenants.getTenant(id);
  }

  @Post()
  create(@Body() body: RegisterTenantBody) {
    return this.tenants.registerTenant(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Owner', 'Admin')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateTenantBody,
  ) {
    return this.tenants.updateTenant(user.tenantId, id, body);
  }
}
