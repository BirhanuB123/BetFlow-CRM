import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { InMemoryService, Tenant } from '../database/in-memory.service';

type RegisterTenantBody = {
  companyName: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  region?: string;
  plan?: string;
};

type UpdateTenantBody = Partial<
  Pick<Tenant, 'name' | 'region' | 'plan' | 'status'>
>;

@Controller('tenants')
export class TenantsController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list() {
    return this.store.listTenants();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.store.getTenant(id);
  }

  @Post()
  create(@Body() body: RegisterTenantBody) {
    return this.store.registerTenant(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateTenantBody) {
    return this.store.updateTenant(id, body);
  }
}
