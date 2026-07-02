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
type ToggleFeatureFlagBody = {
  enabled: boolean;
};
type CompleteOnboardingStepBody = {
  completedByUserId: string;
};
type ExcelImportBody = {
  tenantId: string;
  template: string;
  fileName: string;
  rows: number;
};

const trialPeriod = {
  status: 'active',
  startedAt: '2026-06-26',
  endsAt: '2026-07-10',
  daysRemaining: 9,
  conversionOwnerUserId: 'user_001',
};

const billingAccount = {
  tenantId: 'tenant_001',
  accountName: 'BetFlow Realty LLC',
  billingEmail: 'finance@betflowrealty.com',
  taxId: 'US-88214-CRM',
  paymentMethod: 'Visa ending 4242',
  collectionMode: 'auto_charge',
  nextChargeAt: '2026-07-31',
};

const featureFlags = [
  {
    key: 'customer_portal',
    label: 'Customer portal',
    enabled: true,
    scope: 'tenant',
    rollout: '100%',
  },
  {
    key: 'mobile_pwa',
    label: 'Agent mobile PWA',
    enabled: false,
    scope: 'beta_cohort',
    rollout: '20%',
  },
  {
    key: 'advanced_forecasting',
    label: 'Advanced forecasting',
    enabled: true,
    scope: 'plan',
    rollout: 'Growth+',
  },
  {
    key: 'api_marketplace',
    label: 'API marketplace',
    enabled: false,
    scope: 'tenant',
    rollout: 'internal_preview',
  },
];

const onboardingSteps = [
  {
    key: 'workspace',
    step: 'Create tenant workspace',
    owner: 'platform',
    status: 'complete',
    dueAt: null,
  },
  {
    key: 'users',
    step: 'Invite admin users',
    owner: 'tenant_admin',
    status: 'complete',
    dueAt: null,
  },
  {
    key: 'rbac',
    step: 'Configure roles and permissions',
    owner: 'tenant_admin',
    status: 'in_progress',
    dueAt: '2026-07-02',
  },
  {
    key: 'branding_domain',
    step: 'Publish branding and domain',
    owner: 'brand_admin',
    status: 'in_progress',
    dueAt: '2026-07-03',
  },
  {
    key: 'excel_import',
    step: 'Import leads and inventory from Excel',
    owner: 'sales_ops',
    status: 'not_started',
    dueAt: '2026-07-05',
  },
];

const excelImportTemplates = [
  {
    template: 'Lead import workbook',
    entity: 'leads',
    requiredColumns: ['firstName', 'lastName', 'phone', 'source', 'budget'],
  },
  {
    template: 'Customer import workbook',
    entity: 'customers',
    requiredColumns: ['firstName', 'lastName', 'email', 'phone', 'nationalId'],
  },
  {
    template: 'Unit inventory workbook',
    entity: 'units',
    requiredColumns: ['project', 'building', 'floor', 'unitNumber', 'price', 'status'],
  },
  {
    template: 'Payment schedule workbook',
    entity: 'payments',
    requiredColumns: ['contractRef', 'dueDate', 'amount', 'installmentNumber'],
  },
];

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

  @Get('trial')
  trial() {
    return trialPeriod;
  }

  @Get('usage')
  usage(@Query('tenantId') tenantId?: string) {
    const limits = this.store.listFeatureLimits(tenantId);

    return limits.map((limit) => ({
      ...limit,
      usagePercent: Math.round((limit.used / limit.limit) * 100),
      exceeded: limit.used > limit.limit,
    }));
  }

  @Get('feature-flags')
  listFeatureFlags() {
    return featureFlags;
  }

  @Patch('feature-flags/:key')
  toggleFeatureFlag(
    @Param('key') key: string,
    @Body() body: ToggleFeatureFlagBody,
  ) {
    return {
      key,
      enabled: body.enabled,
      updatedAt: new Date().toISOString(),
    };
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

  @Get('billing/account')
  billingAccount() {
    return billingAccount;
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

  @Get('onboarding')
  onboarding() {
    return onboardingSteps;
  }

  @Patch('onboarding/:key/complete')
  completeOnboardingStep(
    @Param('key') key: string,
    @Body() body: CompleteOnboardingStepBody,
  ) {
    return {
      key,
      status: 'complete',
      completedByUserId: body.completedByUserId,
      completedAt: new Date().toISOString(),
    };
  }

  @Get('imports/excel/templates')
  excelTemplates() {
    return excelImportTemplates;
  }

  @Post('imports/excel')
  createExcelImport(@Body() body: ExcelImportBody) {
    return {
      id: `excel_${Math.random().toString(36).slice(2, 10)}`,
      tenantId: body.tenantId,
      template: body.template,
      fileName: body.fileName,
      rows: body.rows,
      status: 'queued',
      queuedAt: new Date().toISOString(),
    };
  }
}
