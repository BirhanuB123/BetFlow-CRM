import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { InMemoryService } from '../database/in-memory.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Owner', 'Admin')
@Controller('saas')
export class SaasController {
  constructor(private readonly store: InMemoryService) {}

  @Get('branding')
  listBranding() {
    return this.store.listBrandingSettings();
  }

  @Patch('branding/:id')
  updateBranding(
    @Param('id') id: string,
    @Body() body: { value: string; status?: 'live' | 'draft' },
  ) {
    return this.store.updateBrandingSetting(id, body.value, body.status);
  }

  @Post('branding/publish')
  publishBranding() {
    return this.store.publishBrandingSettings();
  }

  @Get('domains')
  listDomains() {
    return this.store.listTenantDomains();
  }

  @Post('domains')
  createDomain(@Body() body: { domain: string }) {
    return this.store.createTenantDomain({ domain: body.domain });
  }

  @Delete('domains/:id')
  deleteDomain(@Param('id') id: string) {
    return this.store.deleteTenantDomain(id);
  }

  @Get('feature-flags')
  listFeatureFlags() {
    return this.store.listFeatureFlags();
  }

  @Patch('feature-flags/:key')
  toggleFeatureFlag(
    @Param('key') key: string,
    @Body() body: { enabled: boolean },
  ) {
    return this.store.toggleFeatureFlag(key, body.enabled);
  }

  @Get('subscription')
  getSubscription() {
    return {
      plans: this.store.listSubscriptionPlans(),
      limits: this.store.listFeatureLimits(),
      billingItems: this.store.listTenantBillingItems(),
      trialPeriod: this.store.getTrialPeriod(),
      billingAccount: this.store.getBillingAccount(),
    };
  }

  @Patch('subscription/billing-account')
  updateBillingAccount(@Body() body: any) {
    return this.store.updateBillingAccount(body);
  }

  @Get('data-transfer-jobs')
  listDataTransferJobs() {
    return this.store.listDataTransferJobs();
  }

  @Post('data-transfer-jobs')
  createDataTransferJob(@Body() body: { type: 'export' | 'import' | 'excel_import'; scope: string }) {
    return this.store.createDataTransferJob({
      type: body.type,
      scope: body.scope,
      requestedByUserId: 'user_001', // Mock log-in user ID
    });
  }

  @Get('excel-import-templates')
  listExcelImportTemplates() {
    return this.store.listExcelImportTemplates();
  }

  @Get('onboarding-steps')
  listOnboardingSteps() {
    return this.store.listOnboardingSteps();
  }

  @Patch('onboarding-steps/:stepName')
  updateOnboardingStep(
    @Param('stepName') stepName: string,
    @Body() body: { status: 'Complete' | 'In progress' | 'Blocked' | 'Not started' },
  ) {
    return this.store.updateOnboardingStep(stepName, body.status);
  }
}
