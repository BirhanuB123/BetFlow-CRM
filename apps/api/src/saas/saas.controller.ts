import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InMemoryService } from '../database/in-memory.service';
import type {
  BrandingSetting,
  DataTransferJob,
  TenantDomain,
} from '../database/in-memory.service';

type CreateTenantDomainBody = Omit<TenantDomain, 'id'>;
type CreateDataTransferJobBody = Omit<DataTransferJob, 'id' | 'requestedAt'>;

@Controller('saas')
export class SaasController {
  constructor(private readonly store: InMemoryService) {}

  @Get('plans')
  plans(@Query('tenantId') tenantId?: string) {
    return this.store.listSubscriptionPlans(tenantId);
  }

  @Get('limits')
  limits(@Query('tenantId') tenantId?: string) {
    return this.store.listFeatureLimits(tenantId);
  }

  @Get('branding')
  branding(@Query('tenantId') tenantId?: string) {
    return this.store.listBrandingSettings(tenantId);
  }

  @Patch('branding/:id')
  updateBranding(
    @Param('id') id: string,
    @Body('value') value: string,
    @Body('status') status?: BrandingSetting['status'],
  ) {
    return this.store.updateBrandingSetting(id, value, status);
  }

  @Get('billing')
  billing(@Query('tenantId') tenantId?: string) {
    return this.store.listTenantBillingItems(tenantId);
  }

  @Get('domains')
  domains(@Query('tenantId') tenantId?: string) {
    return this.store.listTenantDomains(tenantId);
  }

  @Post('domains')
  createDomain(@Body() body: CreateTenantDomainBody) {
    return this.store.createTenantDomain(body);
  }

  @Get('data-jobs')
  dataJobs(@Query('tenantId') tenantId?: string) {
    return this.store.listDataTransferJobs(tenantId);
  }

  @Post('data-jobs')
  createDataJob(@Body() body: CreateDataTransferJobBody) {
    return this.store.createDataTransferJob(body);
  }
}
