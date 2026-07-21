import { Body, Controller, Get, NotFoundException, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { InMemoryService } from '../database/in-memory.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Owner', 'Admin')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  getCurrentTenant() {
    const tenants = this.store.listTenants();
    if (!tenants.length) {
      throw new NotFoundException('No tenants found');
    }
    return tenants[0];
  }

  @Patch(':id')
  updateTenant(
    @Param('id') id: string,
    @Body() body: { name?: string; currency?: string },
  ) {
    return this.store.updateTenant(id, body);
  }
}
