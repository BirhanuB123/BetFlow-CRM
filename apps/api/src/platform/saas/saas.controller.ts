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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequirePermission } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../core/auth/auth.types';
import { SaasService } from './saas.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@RequirePermission('roles.manage')
@Controller('saas')
export class SaasController {
  constructor(private readonly saasService: SaasService) {}

  @Get('branding')
  listBranding() {
    return this.saasService.listBrandingSettings();
  }

  @Patch('branding/:id')
  updateBranding(
    @Param('id') id: string,
    @Body() body: { value: string; status?: 'live' | 'draft' },
  ) {
    return this.saasService.updateBrandingSetting(id, body.value, body.status);
  }

  @Post('branding/publish')
  publishBranding() {
    return this.saasService.publishBrandingSettings();
  }

  @Get('domains')
  listDomains() {
    return this.saasService.listTenantDomains();
  }

  @Post('domains')
  createDomain(@Body() body: { domain: string }) {
    return this.saasService.createTenantDomain({ domain: body.domain });
  }

  @Delete('domains/:id')
  deleteDomain(@Param('id') id: string) {
    return this.saasService.deleteTenantDomain(id);
  }

  @Get('feature-flags')
  listFeatureFlags() {
    return this.saasService.listFeatureFlags();
  }

  @Patch('feature-flags/:key')
  toggleFeatureFlag(
    @Param('key') key: string,
    @Body() body: { enabled: boolean },
  ) {
    return this.saasService.toggleFeatureFlag(key, body.enabled);
  }

  @Get('subscription')
  getSubscription() {
    return this.saasService.getSubscription();
  }

  @Patch('subscription/billing-account')
  updateBillingAccount(@Body() body: any) {
    return this.saasService.updateBillingAccount(body);
  }

  @Get('data-transfer-jobs')
  listDataTransferJobs() {
    return this.saasService.listDataTransferJobs();
  }

  @Post('data-transfer-jobs')
  createDataTransferJob(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { type: 'export' | 'import' | 'excel_import'; scope: string },
  ) {
    return this.saasService.createDataTransferJob({
      type: body.type,
      scope: body.scope,
      requestedByUserId: user?.id || 'user_admin_001',
    });
  }

  @Get('excel-import-templates')
  listExcelImportTemplates() {
    return this.saasService.listExcelImportTemplates();
  }

  @Get('onboarding-steps')
  listOnboardingSteps() {
    return this.saasService.listOnboardingSteps();
  }

  @Patch('onboarding-steps/:stepName')
  updateOnboardingStep(
    @Param('stepName') stepName: string,
    @Body()
    body: { status: 'Complete' | 'In progress' | 'Blocked' | 'Not started' },
  ) {
    return this.saasService.updateOnboardingStep(stepName, body.status);
  }
}
