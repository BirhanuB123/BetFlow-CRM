import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SaasService {
  constructor(private readonly prisma: PrismaService) {}

  // --- TENANTS ---

  async getCurrentTenant() {
    const tenant = await this.prisma.tenant.findFirst();
    if (!tenant) {
      throw new NotFoundException('No tenants found');
    }
    return tenant;
  }

  async updateTenant(
    id: string,
    body: {
      name?: string;
      currency?: string;
      region?: string;
      plan?: string;
      status?: string;
    },
  ) {
    const existing = await this.prisma.tenant.findUnique({ where: { id } });
    let targetId = id;
    if (!existing) {
      const firstTenant = await this.prisma.tenant.findFirst();
      if (!firstTenant) throw new NotFoundException(`Tenant ${id} not found`);
      targetId = firstTenant.id;
    }

    return this.prisma.tenant.update({
      where: { id: targetId },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.currency !== undefined ? { currency: body.currency } : {}),
        ...(body.region !== undefined ? { region: body.region } : {}),
        ...(body.plan !== undefined ? { plan: body.plan } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
    });
  }

  // --- BRANDING ---

  async listBrandingSettings() {
    return this.prisma.brandingSetting.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateBrandingSetting(
    id: string,
    value: string,
    status?: 'live' | 'draft',
  ) {
    const setting = await this.prisma.brandingSetting.findUnique({
      where: { id },
    });
    if (!setting) {
      throw new NotFoundException(`Branding setting ${id} was not found`);
    }

    return this.prisma.brandingSetting.update({
      where: { id },
      data: {
        value,
        ...(status ? { status } : {}),
      },
    });
  }

  async publishBrandingSettings() {
    await this.prisma.brandingSetting.updateMany({
      data: { status: 'live' },
    });
    return this.listBrandingSettings();
  }

  // --- DOMAINS ---

  async listTenantDomains() {
    return this.prisma.tenantDomain.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTenantDomain(input: { domain: string }) {
    return this.prisma.tenantDomain.create({
      data: {
        domain: input.domain,
        status: 'pending_dns',
        ssl: 'pending',
        target: 'tenant.betflow.app',
      },
    });
  }

  async deleteTenantDomain(id: string) {
    const existing = await this.prisma.tenantDomain.findUnique({
      where: { id },
    });
    if (existing) {
      await this.prisma.tenantDomain.delete({ where: { id } });
    }
    return { success: true };
  }

  // --- FEATURE FLAGS ---

  async listFeatureFlags() {
    return this.prisma.featureFlag.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async toggleFeatureFlag(key: string, enabled: boolean) {
    const flag = await this.prisma.featureFlag.findUnique({ where: { key } });
    if (!flag) {
      throw new NotFoundException(`Feature flag ${key} was not found`);
    }

    return this.prisma.featureFlag.update({
      where: { key },
      data: { enabled },
    });
  }

  // --- SUBSCRIPTION & BILLING ---

  async getSubscription() {
    const [plans, limits, billingItems, trialPeriod, billingAccount] =
      await Promise.all([
        this.prisma.subscriptionPlan.findMany({ orderBy: { price: 'asc' } }),
        this.prisma.featureLimit.findMany(),
        this.prisma.tenantBillingItem.findMany({
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.trialPeriod.findFirst(),
        this.prisma.billingAccount.findFirst(),
      ]);

    return {
      plans: plans.map((p) => ({
        ...p,
        price: p.price ? Number(p.price) : null,
      })),
      limits,
      billingItems: billingItems.map((b) => ({
        ...b,
        amount: Number(b.amount),
      })),
      trialPeriod: trialPeriod || {
        status: 'Active',
        startedAt: '2026-07-01T00:00:00.000Z',
        endsAt: '2026-07-15T00:00:00.000Z',
        daysRemaining: 14,
        conversionOwner: 'Maya Johnson',
      },
      billingAccount: billingAccount || {
        accountName: 'BetFlow Realty Ethiopia PLC',
        billingEmail: 'finance@betflow.et',
        taxId: 'ET-TIN-99482104',
        paymentMethod: 'CBE Commercial Bank Direct Debit (*4821)',
        collectionMode: 'Invoice',
        nextCharge: 'Aug 1, 2026',
      },
    };
  }

  async updateBillingAccount(input: Record<string, any>) {
    const first = await this.prisma.billingAccount.findFirst();
    if (first) {
      return this.prisma.billingAccount.update({
        where: { id: first.id },
        data: input,
      });
    }

    return this.prisma.billingAccount.create({
      data: {
        accountName: input.accountName || 'BetFlow Realty Ethiopia PLC',
        billingEmail: input.billingEmail || 'finance@betflow.et',
        taxId: input.taxId || 'ET-TIN-99482104',
        paymentMethod:
          input.paymentMethod || 'CBE Commercial Bank Direct Debit (*4821)',
        collectionMode: input.collectionMode || 'Invoice',
        nextCharge: input.nextCharge || 'Aug 1, 2026',
      },
    });
  }

  // --- DATA TRANSFER JOBS ---

  async listDataTransferJobs() {
    return this.prisma.dataTransferJob.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDataTransferJob(input: {
    type: 'export' | 'import' | 'excel_import';
    scope: string;
    requestedByUserId: string;
  }) {
    const requestedAt =
      'Today, ' +
      new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

    return this.prisma.dataTransferJob.create({
      data: {
        type: input.type,
        scope: input.scope,
        requestedByUserId: input.requestedByUserId,
        requestedAt,
        status: 'ready',
      },
    });
  }

  async listExcelImportTemplates() {
    return this.prisma.excelImportTemplate.findMany();
  }

  // --- ONBOARDING STEPS ---

  async listOnboardingSteps() {
    return this.prisma.onboardingStep.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateOnboardingStep(stepName: string, status: string) {
    const step = await this.prisma.onboardingStep.findUnique({
      where: { step: stepName },
    });

    if (!step) {
      throw new NotFoundException(`Onboarding step ${stepName} was not found`);
    }

    return this.prisma.onboardingStep.update({
      where: { step: stepName },
      data: { status },
    });
  }
}
