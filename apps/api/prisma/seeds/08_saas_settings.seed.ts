import { PrismaClient } from '@prisma/client';

export async function seedSaasAndSettings(prisma: PrismaClient) {
  // 1. Seed Tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: 'tenant_001' },
    update: {},
    create: {
      id: 'tenant_001',
      name: 'BetFlow Realty',
      slug: 'betflow',
      region: 'US East',
      plan: 'Enterprise Tier',
      status: 'active',
      currency: 'ETB',
    },
  });

  // 2. Seed Branding Settings
  const brandingSettings = [
    {
      id: 'brand_name',
      label: 'Workspace name',
      value: 'BetFlow Realty',
      status: 'live',
    },
    {
      id: 'brand_color',
      label: 'Primary color',
      value: '#18181b',
      status: 'live',
    },
    {
      id: 'brand_logo',
      label: 'Logo',
      value: 'betflow_logo.svg',
      status: 'live',
    },
    {
      id: 'brand_login',
      label: 'Login message',
      value: 'Welcome to BetFlow Realty',
      status: 'draft',
    },
  ];

  for (const item of brandingSettings) {
    await prisma.brandingSetting.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  // 3. Seed Tenant Domains
  const domains = [
    {
      id: 'domain_001',
      domain: 'crm.betflowrealty.com',
      status: 'verified',
      ssl: 'active',
      target: 'tenant.betflow.app',
    },
    {
      id: 'domain_002',
      domain: 'sales.betflowrealty.com',
      status: 'pending_dns',
      ssl: 'pending',
      target: 'tenant.betflow.app',
    },
  ];

  for (const item of domains) {
    await prisma.tenantDomain.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  // 4. Seed Feature Flags
  const featureFlags = [
    {
      key: 'customer_portal',
      label: 'Customer portal',
      description:
        'Enable buyer login, payment schedules, document downloads, and support requests.',
      enabled: true,
      scope: 'Tenant',
      rollout: '100%',
    },
    {
      key: 'mobile_pwa',
      label: 'Agent mobile PWA',
      description:
        'Allow installable mobile shell, push notifications, and offline visit notes.',
      enabled: false,
      scope: 'Beta cohort',
      rollout: '20%',
    },
    {
      key: 'advanced_forecasting',
      label: 'Advanced forecasting',
      description:
        'Use weighted pipeline, payment schedules, and unit absorption predictions.',
      enabled: true,
      scope: 'Plan',
      rollout: 'Growth+',
    },
    {
      key: 'api_marketplace',
      label: 'API marketplace',
      description:
        'Expose webhook subscriptions, partner app scopes, and API keys.',
      enabled: false,
      scope: 'Tenant',
      rollout: 'Internal preview',
    },
  ];

  for (const item of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key: item.key },
      update: {},
      create: item,
    });
  }

  // 5. Seed Subscription Plans
  const plans = [
    {
      id: 'plan_growth',
      name: 'Growth',
      price: 499,
      billingCycle: 'monthly',
      status: 'current',
      includes: [
        '25 users',
        '500 active leads',
        '3 custom domains',
        'API access',
      ],
    },
    {
      id: 'plan_scale',
      name: 'Scale',
      price: 899,
      billingCycle: 'monthly',
      status: 'available',
      includes: [
        '75 users',
        '2,000 active leads',
        '10 custom domains',
        'Priority support',
      ],
    },
    {
      id: 'plan_enterprise',
      name: 'Enterprise',
      price: null,
      billingCycle: 'annual',
      status: 'available',
      includes: [
        'Unlimited users',
        'Dedicated tenant controls',
        'SAML SSO',
        'Data residency',
      ],
    },
  ];

  for (const item of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  // 6. Seed Feature Limits
  const limits = [
    {
      id: 'limit_users',
      feature: 'Users',
      used: 24,
      limit: 25,
      unit: 'seats',
    },
    {
      id: 'limit_leads',
      feature: 'Active leads',
      used: 248,
      limit: 500,
      unit: 'leads',
    },
    {
      id: 'limit_storage',
      feature: 'Storage',
      used: 82,
      limit: 250,
      unit: 'GB',
    },
    {
      id: 'limit_domains',
      feature: 'Custom domains',
      used: 1,
      limit: 3,
      unit: 'domains',
    },
  ];

  for (const item of limits) {
    await prisma.featureLimit.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  // 7. Seed Billing Account & Trial Period
  await prisma.billingAccount.upsert({
    where: { id: 'billing_account_001' },
    update: {},
    create: {
      id: 'billing_account_001',
      accountName: 'BetFlow Realty Ethiopia PLC',
      billingEmail: 'finance@betflow.et',
      taxId: 'ET-TIN-99482104',
      paymentMethod: 'CBE Commercial Bank Direct Debit (*4821)',
      collectionMode: 'Invoice',
      nextCharge: 'Aug 1, 2026',
    },
  });

  await prisma.trialPeriod.upsert({
    where: { id: 'trial_period_001' },
    update: {},
    create: {
      id: 'trial_period_001',
      status: 'Active',
      startedAt: '2026-07-01T00:00:00.000Z',
      endsAt: '2026-07-15T00:00:00.000Z',
      daysRemaining: 14,
      conversionOwner: 'Maya Johnson',
    },
  });

  // 8. Seed Tenant Billing Items
  const billingItems = [
    {
      id: 'billing_001',
      invoice: 'INV-2026-006',
      period: 'June 2026',
      amount: 499,
      status: 'paid',
      dueDate: '2026-06-30',
    },
    {
      id: 'billing_002',
      invoice: 'INV-2026-007',
      period: 'July 2026',
      amount: 499,
      status: 'due',
      dueDate: '2026-07-31',
    },
    {
      id: 'billing_003',
      invoice: 'ADD-2026-012',
      period: 'Storage overage',
      amount: 42,
      status: 'due',
      dueDate: '2026-07-31',
    },
  ];

  for (const item of billingItems) {
    await prisma.tenantBillingItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  // 9. Seed Onboarding Steps
  const onboardingSteps = [
    {
      id: 'onboard_001',
      step: 'Create tenant workspace',
      owner: 'Platform',
      status: 'Complete',
      due: 'Done',
    },
    {
      id: 'onboard_002',
      step: 'Invite admin users',
      owner: 'Tenant admin',
      status: 'Complete',
      due: 'Done',
    },
    {
      id: 'onboard_003',
      step: 'Configure roles and permissions',
      owner: 'Tenant admin',
      status: 'In progress',
      due: '2026-07-02',
    },
    {
      id: 'onboard_004',
      step: 'Publish branding and domain',
      owner: 'Brand admin',
      status: 'In progress',
      due: '2026-07-03',
    },
    {
      id: 'onboard_005',
      step: 'Import leads and inventory from Excel',
      owner: 'Sales ops',
      status: 'Not started',
      due: '2026-07-05',
    },
    {
      id: 'onboard_006',
      step: 'Enable automation and portal',
      owner: 'Operations',
      status: 'Blocked',
      due: 'Needs DNS',
    },
  ];

  for (const item of onboardingSteps) {
    await prisma.onboardingStep.upsert({
      where: { step: item.step },
      update: {},
      create: item,
    });
  }

  // 10. Seed Excel Import Templates
  const templates = [
    {
      id: 'tpl_001',
      template: 'Lead import workbook',
      entity: 'Leads',
      requiredColumns: ['firstName', 'lastName', 'phone', 'source', 'budget'],
      lastRun: 'Yesterday',
      status: 'Ready',
    },
    {
      id: 'tpl_002',
      template: 'Customer import workbook',
      entity: 'Customers',
      requiredColumns: [
        'firstName',
        'lastName',
        'email',
        'phone',
        'nationalId',
      ],
      lastRun: '2026-06-28',
      status: 'Ready',
    },
    {
      id: 'tpl_003',
      template: 'Unit inventory workbook',
      entity: 'Units',
      requiredColumns: [
        'project',
        'building',
        'floor',
        'unitNumber',
        'price',
        'status',
      ],
      lastRun: 'Today',
      status: 'Processing',
    },
  ];

  for (const item of templates) {
    await prisma.excelImportTemplate.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  // 11. Seed Notification Outbound Messages Queue
  const messages = [
    {
      id: 'notification_001',
      channel: 'sms',
      recipient: 'Ari Kaplan',
      subject: 'Site visit reminder for A-1802',
      relatedTo: 'visit_001',
      scheduledFor: '2026-06-30T17:30:00.000Z',
      status: 'scheduled',
    },
    {
      id: 'notification_002',
      channel: 'telegram',
      recipient: 'Omar Haddad',
      subject: 'Kaplan deposit approved',
      relatedTo: 'payment_001',
      scheduledFor: '2026-06-30T14:10:00.000Z',
      status: 'sent',
    },
    {
      id: 'notification_003',
      channel: 'email',
      recipient: 'Bell Family Office',
      subject: 'Reservation deposit reminder',
      relatedTo: 'reservation_001',
      scheduledFor: '2026-06-30T20:00:00.000Z',
      status: 'queued',
    },
  ];

  for (const msg of messages) {
    await prisma.notificationMessage.upsert({
      where: { id: msg.id },
      update: {},
      create: msg,
    });
  }

  return tenant;
}
