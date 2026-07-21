import { Injectable, NotFoundException } from '@nestjs/common';

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  region: string;
  plan: string;
  status: 'active' | 'suspended';
  ownerUserId: string;
  domain?: string | null;
  currency?: string | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: 'active' | 'invited' | 'suspended';
};

export type Role = {
  id: string;
  name: string;
  description: string;
  permissionKeys: string[];
};

export type Permission = {
  key: string;
  label: string;
  group: string;
};

export type AuditLog = {
  id: string;
  actor: string;
  action: string;
  target: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
};

export type LeadStage =
  'new' | 'qualified' | 'tour_scheduled' | 'proposal' | 'won' | 'lost';

export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  budget: number;
  stage: LeadStage;
  assignedToUserId?: string;
  priority: 'high' | 'medium' | 'low';
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'buyer' | 'investor' | 'tenant';
  ownerUserId: string;
  status: 'active' | 'onboarding' | 'dormant';
};

export type Deal = {
  id: string;
  leadId: string;
  customerId: string;
  propertyName: string;
  value: number;
  stage: LeadStage;
  probability: number;
  closeDate: string;
  ownerUserId: string;
};

export type Task = {
  id: string;
  title: string;
  ownerUserId: string;
  relatedTo: string;
  dueDate: string;
  status: 'open' | 'in_progress' | 'done';
  priority: 'high' | 'medium' | 'low';
};

export type Note = {
  id: string;
  relatedTo: string;
  authorUserId: string;
  body: string;
  createdAt: string;
};

export type Activity = {
  id: string;
  actorUserId: string;
  action: string;
  target: string;
  type: 'call' | 'email' | 'assignment' | 'task' | 'note' | 'deal';
  createdAt: string;
};

export type Project = {
  id: string;
  name: string;
  location: string;
  status: 'planning' | 'active' | 'selling' | 'delivered';
};

export type Building = {
  id: string;
  projectId: string;
  name: string;
  address: string;
  floors: number;
  status: 'pre_launch' | 'open' | 'limited' | 'closed';
};

export type Floor = {
  id: string;
  buildingId: string;
  label: string;
  releaseStatus: 'draft' | 'released' | 'hold';
};

export type UnitStatus = 'available' | 'reserved' | 'sold' | 'blocked';

export type Unit = {
  id: string;
  projectId: string;
  buildingId: string;
  floorId: string;
  unitNumber: string;
  type: 'studio' | '1br' | '2br' | '3br' | 'retail';
  areaSqft: number;
  price: number;
  status: UnitStatus;
  availableFrom: string;
  exposure: 'north' | 'south' | 'east' | 'west';
};

export type PropertyMedia = {
  id: string;
  projectId: string;
  title: string;
  type: 'photo' | 'floor_plan' | 'document' | 'virtual_tour';
  usage: 'public' | 'internal' | 'sales_packet';
  url: string;
  updatedAt: string;
};

export type SiteVisit = {
  id: string;
  leadId: string;
  unitId: string;
  agentUserId: string;
  scheduledFor: string;
  status: 'scheduled' | 'completed' | 'no_show';
  outcome: string;
};

export type Reservation = {
  id: string;
  customerId: string;
  unitId: string;
  expiresAt: string;
  depositAmount: number;
  status: 'draft' | 'pending_payment' | 'reserved' | 'expired';
  ownerUserId: string;
};

export type PaymentScheduleItem = {
  id: string;
  reservationId: string;
  milestone: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
};

export type PaymentTransaction = {
  id: string;
  reservationId: string;
  customerId: string;
  method: 'bank_transfer' | 'card' | 'check';
  amount: number;
  receivedAt?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
};

export type ReceiptUpload = {
  id: string;
  paymentId: string;
  fileName: string;
  uploadedByUserId: string;
  uploadedAt: string;
  status: 'uploaded' | 'under_review' | 'approved' | 'rejected';
};

export type FinanceApproval = {
  id: string;
  reservationId: string;
  reviewerUserId: string;
  paymentId: string;
  amount: number;
  submittedAt: string;
  status: 'waiting' | 'approved' | 'needs_revision';
  note: string;
};

export type UploadedDocument = {
  id: string;
  name: string;
  category: 'kyc' | 'proof_of_payment' | 'reservation' | 'contract';
  relatedTo: string;
  uploadedByUserId: string;
  uploadedAt: string;
  status: 'uploaded' | 'verified' | 'rejected';
};

export type ContractTemplate = {
  id: string;
  name: string;
  type: 'reservation' | 'sale_agreement' | 'addendum';
  version: string;
  status: 'active' | 'draft';
  updatedAt: string;
};

export type GeneratedContractPdf = {
  id: string;
  templateId: string;
  customerId: string;
  unitId: string;
  generatedAt: string;
  status: 'generated' | 'sent' | 'regenerating';
};

export type LegalContractApproval = {
  id: string;
  generatedPdfId: string;
  reviewerUserId: string;
  submittedAt: string;
  status: 'waiting' | 'approved' | 'needs_changes';
  note: string;
};

export type SignedContract = {
  id: string;
  generatedPdfId: string;
  customerId: string;
  signedAt?: string;
  storagePath: string;
  status: 'stored' | 'pending_countersign' | 'archived';
};

export type NotificationMessage = {
  id: string;
  channel: 'sms' | 'telegram' | 'email';
  recipient: string;
  subject: string;
  relatedTo: string;
  scheduledFor: string;
  status: 'queued' | 'sent' | 'failed' | 'scheduled';
};

export type OverduePaymentAlert = {
  id: string;
  customerId: string;
  reservationId: string;
  amount: number;
  overdueBy: string;
  ownerUserId: string;
  priority: 'high' | 'medium' | 'low';
};

export type FollowUpReminder = {
  id: string;
  leadId: string;
  ownerUserId: string;
  dueAt: string;
  reason: string;
  channel: 'sms' | 'telegram' | 'email';
  priority: 'high' | 'medium' | 'low';
};

export type ReportMetric = {
  label: string;
  value: string;
  detail: string;
};

export type AgentPerformanceReport = {
  agent: string;
  leads: number;
  visits: number;
  reservations: number;
  revenue: number;
  conversionRate: number;
};

export type RevenueReportRow = {
  period: string;
  booked: number;
  collected: number;
  outstanding: number;
  forecast: number;
};

export type InventoryReportRow = {
  project: string;
  totalUnits: number;
  available: number;
  reserved: number;
  sold: number;
  blocked: number;
};

export type ConversionReportRow = {
  stage: string;
  count: number;
  rate: number;
  dropOff: number;
};

export type PaymentAgingReportRow = {
  bucket: string;
  invoices: number;
  amount: number;
  risk: 'low' | 'medium' | 'high';
};

export type ReportCatalogEntry = {
  id: string;
  name: string;
  description: string;
  folder: string;
  href: string;
  lastAccessedAt: string | null;
  createdBy: string | null;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number | null;
  billingCycle: 'monthly' | 'annual';
  status: 'current' | 'available';
  includes: string[];
};

export type FeatureLimit = {
  id: string;
  feature: string;
  used: number;
  limit: number;
  unit: string;
};

export type BrandingSetting = {
  id: string;
  label: string;
  value: string;
  status: 'live' | 'draft';
};

export type TenantBillingItem = {
  id: string;
  invoice: string;
  period: string;
  amount: number;
  status: 'paid' | 'due' | 'failed';
  dueDate: string;
};

export type TenantDomain = {
  id: string;
  domain: string;
  status: 'verified' | 'pending_dns' | 'failed';
  ssl: 'active' | 'pending';
  target: string;
};

export type DataTransferJob = {
  id: string;
  type: 'export' | 'import' | 'excel_import';
  scope: string;
  requestedByUserId: string;
  requestedAt: string;
  status: 'ready' | 'processing' | 'failed';
};

type RegisterTenantInput = {
  companyName: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  region?: string;
  plan?: string;
};

type InviteUserInput = {
  name: string;
  email: string;
  roleId: string;
};

type UpdateTenantInput = Partial<
  Pick<Tenant, 'name' | 'region' | 'plan' | 'status'>
>;

type CreateLeadInput = Omit<Lead, 'id'>;
type CreateCustomerInput = Omit<Customer, 'id'>;
type CreateDealInput = Omit<Deal, 'id'>;
type CreateTaskInput = Omit<Task, 'id'>;
type CreateNoteInput = Omit<Note, 'id' | 'createdAt'>;
type CreateActivityInput = Omit<Activity, 'id' | 'createdAt'>;
type CreateProjectInput = Omit<Project, 'id'>;
type CreateBuildingInput = Omit<Building, 'id'>;
type CreateFloorInput = Omit<Floor, 'id'>;
type CreateUnitInput = Omit<Unit, 'id'>;
type CreatePropertyMediaInput = Omit<PropertyMedia, 'id' | 'updatedAt'>;
type CreateSiteVisitInput = Omit<SiteVisit, 'id'>;
type CreateReservationInput = Omit<Reservation, 'id'>;
type CreatePaymentScheduleInput = Omit<PaymentScheduleItem, 'id'>;
type CreatePaymentTransactionInput = Omit<PaymentTransaction, 'id'>;
type CreateReceiptUploadInput = Omit<ReceiptUpload, 'id' | 'uploadedAt'>;
type CreateFinanceApprovalInput = Omit<FinanceApproval, 'id' | 'submittedAt'>;
type CreateUploadedDocumentInput = Omit<UploadedDocument, 'id' | 'uploadedAt'>;
type CreateContractTemplateInput = Omit<ContractTemplate, 'id' | 'updatedAt'>;
type CreateGeneratedContractPdfInput = Omit<
  GeneratedContractPdf,
  'id' | 'generatedAt'
>;
type CreateLegalContractApprovalInput = Omit<
  LegalContractApproval,
  'id' | 'submittedAt'
>;
type CreateSignedContractInput = Omit<SignedContract, 'id'>;
type CreateNotificationMessageInput = Omit<NotificationMessage, 'id'>;
type CreateOverduePaymentAlertInput = Omit<OverduePaymentAlert, 'id'>;
type CreateFollowUpReminderInput = Omit<FollowUpReminder, 'id'>;
type CreateTenantDomainInput = { domain: string };
type CreateDataTransferJobInput = Omit<
  DataTransferJob,
  'id' | 'requestedAt' | 'status'
>;

export type FeatureFlag = {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  scope: 'Tenant' | 'Plan' | 'Beta cohort';
  rollout: string;
};

export type OnboardingStep = {
  step: string;
  owner: string;
  status: 'Complete' | 'In progress' | 'Blocked' | 'Not started';
  due: string;
};

export type ExcelImportTemplate = {
  template: string;
  entity: 'Leads' | 'Customers' | 'Units' | 'Payments';
  requiredColumns: string[];
  lastRun: string;
  status: 'Ready' | 'Processing' | 'Failed';
};

export type TrialPeriod = {
  status: 'Active' | 'Expired' | 'Converted';
  startedAt: string;
  endsAt: string;
  daysRemaining: number;
  conversionOwner: string;
};

export type BillingAccount = {
  accountName: string;
  billingEmail: string;
  taxId: string;
  paymentMethod: string;
  collectionMode: 'Auto-charge' | 'Invoice';
  nextCharge: string;
};

@Injectable()
export class InMemoryService {
  private readonly permissions: Permission[] = [
    { key: 'tenant.manage', label: 'Manage tenant settings', group: 'Tenant' },
    { key: 'users.manage', label: 'Invite and manage users', group: 'Users' },
    {
      key: 'roles.manage',
      label: 'Manage roles and permissions',
      group: 'RBAC',
    },
    { key: 'audit.read', label: 'Read audit logs', group: 'Audit' },
    {
      key: 'dashboard.read',
      label: 'View dashboard shell',
      group: 'Dashboard',
    },
  ];

  private readonly tenants: Tenant[] = [
    {
      id: 'tenant_001',
      name: 'BetFlow Realty',
      slug: 'betflow',
      region: 'US East',
      plan: 'Growth',
      status: 'active',
      ownerUserId: 'user_001',
      domain: 'crm.betflowrealty.com',
      currency: 'ETB',
    },
  ];

  private readonly roles: Role[] = [
    {
      id: 'role_owner',
      name: 'Owner',
      description: 'Full tenant administration access.',
      permissionKeys: [
        'tenant.manage',
        'users.manage',
        'roles.manage',
        'audit.read',
        'dashboard.read',
      ],
    },
    {
      id: 'role_admin',
      name: 'Admin',
      description: 'Operational administration without ownership controls.',
      permissionKeys: [
        'users.manage',
        'roles.manage',
        'audit.read',
        'dashboard.read',
      ],
    },
    {
      id: 'role_agent',
      name: 'Agent',
      description: 'Default sales workspace access.',
      permissionKeys: ['dashboard.read'],
    },
  ];

  private readonly users: User[] = [
    {
      id: 'user_001',
      name: 'Maya Johnson',
      email: 'maya@betflow.example',
      roleId: 'role_owner',
      status: 'active',
    },
    {
      id: 'user_002',
      name: 'Omar Haddad',
      email: 'omar@betflow.example',
      roleId: 'role_admin',
      status: 'active',
    },
  ];

  private readonly auditLogs: AuditLog[] = [
    {
      id: 'audit_001',
      actor: 'Maya Johnson',
      action: 'Registered tenant',
      target: 'BetFlow Realty',
      severity: 'info',
      createdAt: new Date('2026-06-29T08:00:00.000Z').toISOString(),
    },
    {
      id: 'audit_002',
      actor: 'System',
      action: 'Initialized default roles',
      target: 'RBAC',
      severity: 'info',
      createdAt: new Date('2026-06-29T08:01:00.000Z').toISOString(),
    },
  ];

  private readonly leads: Lead[] = [
    {
      id: 'lead_001',
      name: 'Ari Kaplan',
      company: 'Kaplan Holdings',
      email: 'ari@kaplan.example',
      phone: '+1 555 0182',
      source: 'website',
      budget: 1800000,
      stage: 'qualified',
      assignedToUserId: 'user_002',
      priority: 'high',
    },
    {
      id: 'lead_002',
      name: 'Priya Shah',
      company: 'Northline Capital',
      email: 'priya@northline.example',
      phone: '+1 555 0144',
      source: 'referral',
      budget: 920000,
      stage: 'tour_scheduled',
      assignedToUserId: 'user_002',
      priority: 'medium',
    },
  ];

  private readonly customers: Customer[] = [
    {
      id: 'customer_001',
      name: 'Kaplan Holdings',
      email: 'ari@kaplan.example',
      phone: '+1 555 0182',
      type: 'investor',
      ownerUserId: 'user_002',
      status: 'onboarding',
    },
    {
      id: 'customer_002',
      name: 'Bell Family Office',
      email: 'marcus@bell.example',
      phone: '+1 555 0118',
      type: 'buyer',
      ownerUserId: 'user_001',
      status: 'active',
    },
  ];

  private readonly deals: Deal[] = [
    {
      id: 'deal_001',
      leadId: 'lead_001',
      customerId: 'customer_001',
      propertyName: 'Harbor Point Tower',
      value: 1800000,
      stage: 'qualified',
      probability: 45,
      closeDate: '2026-07-18',
      ownerUserId: 'user_002',
    },
    {
      id: 'deal_002',
      leadId: 'lead_002',
      customerId: 'customer_002',
      propertyName: 'Meridian Residences',
      value: 2400000,
      stage: 'proposal',
      probability: 70,
      closeDate: '2026-08-02',
      ownerUserId: 'user_001',
    },
  ];

  private readonly tasks: Task[] = [
    {
      id: 'task_001',
      title: 'Send updated unit availability',
      ownerUserId: 'user_002',
      relatedTo: 'customer_001',
      dueDate: '2026-07-01',
      status: 'open',
      priority: 'high',
    },
  ];

  private readonly notes: Note[] = [
    {
      id: 'note_001',
      relatedTo: 'customer_001',
      authorUserId: 'user_002',
      body: 'Buyer wants two comparable investment options before the next call.',
      createdAt: new Date('2026-06-30T10:22:00.000Z').toISOString(),
    },
  ];

  private readonly activities: Activity[] = [
    {
      id: 'activity_001',
      actorUserId: 'user_002',
      action: 'Assigned lead',
      target: 'lead_001',
      type: 'assignment',
      createdAt: new Date('2026-06-30T10:42:00.000Z').toISOString(),
    },
  ];

  private readonly projects: Project[] = [
    {
      id: 'project_001',
      name: 'Harbor Point',
      location: 'Miami, FL',
      status: 'selling',
    },
    {
      id: 'project_002',
      name: 'Meridian Residences',
      location: 'Austin, TX',
      status: 'active',
    },
  ];

  private readonly buildings: Building[] = [
    {
      id: 'building_001',
      projectId: 'project_001',
      name: 'Harbor Tower A',
      address: '210 Bayfront Ave',
      floors: 24,
      status: 'open',
    },
    {
      id: 'building_002',
      projectId: 'project_002',
      name: 'Meridian North',
      address: '88 Trinity St',
      floors: 16,
      status: 'open',
    },
  ];

  private readonly floors: Floor[] = [
    {
      id: 'floor_001',
      buildingId: 'building_001',
      label: 'Floor 18',
      releaseStatus: 'released',
    },
    {
      id: 'floor_002',
      buildingId: 'building_002',
      label: 'Floor 9',
      releaseStatus: 'released',
    },
  ];

  private readonly units: Unit[] = [
    {
      id: 'unit_001',
      projectId: 'project_001',
      buildingId: 'building_001',
      floorId: 'floor_001',
      unitNumber: 'A-1802',
      type: '2br',
      areaSqft: 1240,
      price: 1180000,
      status: 'available',
      availableFrom: '2026-06-30',
      exposure: 'east',
    },
    {
      id: 'unit_002',
      projectId: 'project_001',
      buildingId: 'building_001',
      floorId: 'floor_001',
      unitNumber: 'A-1803',
      type: '3br',
      areaSqft: 1680,
      price: 1740000,
      status: 'reserved',
      availableFrom: '2026-07-05',
      exposure: 'south',
    },
    {
      id: 'unit_003',
      projectId: 'project_002',
      buildingId: 'building_002',
      floorId: 'floor_002',
      unitNumber: 'N-0905',
      type: '2br',
      areaSqft: 1110,
      price: 940000,
      status: 'available',
      availableFrom: '2026-06-30',
      exposure: 'west',
    },
  ];

  private readonly propertyMedia: PropertyMedia[] = [
    {
      id: 'media_001',
      projectId: 'project_001',
      title: 'Harbor Point exterior gallery',
      type: 'photo',
      usage: 'public',
      url: '/media/harbor-point-gallery',
      updatedAt: new Date('2026-06-30T09:30:00.000Z').toISOString(),
    },
    {
      id: 'media_002',
      projectId: 'project_001',
      title: 'Tower A floor plans',
      type: 'floor_plan',
      usage: 'sales_packet',
      url: '/media/tower-a-floor-plans',
      updatedAt: new Date('2026-06-29T14:10:00.000Z').toISOString(),
    },
  ];

  private readonly siteVisits: SiteVisit[] = [
    {
      id: 'visit_001',
      leadId: 'lead_001',
      unitId: 'unit_001',
      agentUserId: 'user_002',
      scheduledFor: new Date('2026-06-30T18:30:00.000Z').toISOString(),
      status: 'scheduled',
      outcome: 'Awaiting visit',
    },
    {
      id: 'visit_002',
      leadId: 'lead_002',
      unitId: 'unit_003',
      agentUserId: 'user_002',
      scheduledFor: new Date('2026-07-01T15:00:00.000Z').toISOString(),
      status: 'scheduled',
      outcome: 'Confirmed by email',
    },
  ];

  private readonly reservations: Reservation[] = [
    {
      id: 'reservation_001',
      customerId: 'customer_002',
      unitId: 'unit_002',
      expiresAt: '2026-07-05',
      depositAmount: 50000,
      status: 'pending_payment',
      ownerUserId: 'user_001',
    },
    {
      id: 'reservation_002',
      customerId: 'customer_001',
      unitId: 'unit_001',
      expiresAt: '2026-07-08',
      depositAmount: 35000,
      status: 'reserved',
      ownerUserId: 'user_002',
    },
  ];

  private readonly paymentSchedule: PaymentScheduleItem[] = [
    {
      id: 'schedule_001',
      reservationId: 'reservation_001',
      milestone: 'Reservation deposit',
      dueDate: '2026-07-05',
      amount: 50000,
      status: 'pending',
    },
    {
      id: 'schedule_002',
      reservationId: 'reservation_002',
      milestone: 'Reservation deposit',
      dueDate: '2026-06-30',
      amount: 35000,
      status: 'paid',
    },
  ];

  private readonly paymentTransactions: PaymentTransaction[] = [
    {
      id: 'payment_001',
      reservationId: 'reservation_002',
      customerId: 'customer_001',
      method: 'bank_transfer',
      amount: 35000,
      receivedAt: new Date('2026-06-30T13:15:00.000Z').toISOString(),
      status: 'paid',
    },
    {
      id: 'payment_002',
      reservationId: 'reservation_001',
      customerId: 'customer_002',
      method: 'check',
      amount: 25000,
      status: 'partially_paid',
    },
  ];

  private readonly receiptUploads: ReceiptUpload[] = [
    {
      id: 'receipt_001',
      paymentId: 'payment_001',
      fileName: 'kaplan-deposit-wire.pdf',
      uploadedByUserId: 'user_002',
      uploadedAt: new Date('2026-06-30T13:18:00.000Z').toISOString(),
      status: 'approved',
    },
    {
      id: 'receipt_002',
      paymentId: 'payment_002',
      fileName: 'bell-check-scan.jpg',
      uploadedByUserId: 'user_001',
      uploadedAt: new Date('2026-06-30T14:02:00.000Z').toISOString(),
      status: 'under_review',
    },
  ];

  private readonly financeApprovals: FinanceApproval[] = [
    {
      id: 'approval_001',
      reservationId: 'reservation_001',
      reviewerUserId: 'user_001',
      paymentId: 'payment_002',
      amount: 25000,
      submittedAt: new Date('2026-06-30T14:04:00.000Z').toISOString(),
      status: 'waiting',
      note: 'Partial deposit requires finance confirmation.',
    },
    {
      id: 'approval_002',
      reservationId: 'reservation_002',
      reviewerUserId: 'user_001',
      paymentId: 'payment_001',
      amount: 35000,
      submittedAt: new Date('2026-06-30T13:22:00.000Z').toISOString(),
      status: 'approved',
      note: 'Wire receipt matched bank ledger.',
    },
  ];

  private readonly uploadedDocuments: UploadedDocument[] = [
    {
      id: 'document_001',
      name: 'kaplan-passport.pdf',
      category: 'kyc',
      relatedTo: 'customer_001',
      uploadedByUserId: 'user_002',
      uploadedAt: new Date('2026-06-30T15:12:00.000Z').toISOString(),
      status: 'verified',
    },
    {
      id: 'document_002',
      name: 'bell-reservation-form.pdf',
      category: 'reservation',
      relatedTo: 'reservation_001',
      uploadedByUserId: 'user_001',
      uploadedAt: new Date('2026-06-30T14:28:00.000Z').toISOString(),
      status: 'uploaded',
    },
  ];

  private readonly contractTemplates: ContractTemplate[] = [
    {
      id: 'template_001',
      name: 'Standard reservation agreement',
      type: 'reservation',
      version: 'v2.4',
      status: 'active',
      updatedAt: new Date('2026-06-27T12:00:00.000Z').toISOString(),
    },
    {
      id: 'template_002',
      name: 'Residential sale agreement',
      type: 'sale_agreement',
      version: 'v1.9',
      status: 'active',
      updatedAt: new Date('2026-06-22T12:00:00.000Z').toISOString(),
    },
  ];

  private readonly generatedContractPdfs: GeneratedContractPdf[] = [
    {
      id: 'contract_pdf_001',
      templateId: 'template_001',
      customerId: 'customer_002',
      unitId: 'unit_002',
      generatedAt: new Date('2026-06-30T15:05:00.000Z').toISOString(),
      status: 'sent',
    },
    {
      id: 'contract_pdf_002',
      templateId: 'template_002',
      customerId: 'customer_001',
      unitId: 'unit_001',
      generatedAt: new Date('2026-06-30T13:44:00.000Z').toISOString(),
      status: 'generated',
    },
  ];

  private readonly legalContractApprovals: LegalContractApproval[] = [
    {
      id: 'contract_approval_001',
      generatedPdfId: 'contract_pdf_001',
      reviewerUserId: 'user_001',
      submittedAt: new Date('2026-06-30T15:08:00.000Z').toISOString(),
      status: 'waiting',
      note: 'Deposit clause requires confirmation.',
    },
    {
      id: 'contract_approval_002',
      generatedPdfId: 'contract_pdf_002',
      reviewerUserId: 'user_001',
      submittedAt: new Date('2026-06-29T15:08:00.000Z').toISOString(),
      status: 'approved',
      note: 'Approved for signature.',
    },
  ];

  private readonly signedContracts: SignedContract[] = [
    {
      id: 'signed_contract_001',
      generatedPdfId: 'contract_pdf_002',
      customerId: 'customer_001',
      signedAt: new Date('2026-06-30T16:14:00.000Z').toISOString(),
      storagePath: 'contracts/2026/kaplan-sale-agreement.pdf',
      status: 'stored',
    },
    {
      id: 'signed_contract_002',
      generatedPdfId: 'contract_pdf_001',
      customerId: 'customer_002',
      storagePath: 'contracts/pending/bell-reservation-agreement.pdf',
      status: 'pending_countersign',
    },
  ];

  private readonly notificationMessages: NotificationMessage[] = [
    {
      id: 'notification_001',
      channel: 'sms',
      recipient: 'Ari Kaplan',
      subject: 'Site visit reminder for A-1802',
      relatedTo: 'visit_001',
      scheduledFor: new Date('2026-06-30T17:30:00.000Z').toISOString(),
      status: 'scheduled',
    },
    {
      id: 'notification_002',
      channel: 'telegram',
      recipient: 'Omar Haddad',
      subject: 'Kaplan deposit approved',
      relatedTo: 'payment_001',
      scheduledFor: new Date('2026-06-30T14:10:00.000Z').toISOString(),
      status: 'sent',
    },
    {
      id: 'notification_003',
      channel: 'email',
      recipient: 'Bell Family Office',
      subject: 'Reservation deposit reminder',
      relatedTo: 'reservation_001',
      scheduledFor: new Date('2026-06-30T20:00:00.000Z').toISOString(),
      status: 'queued',
    },
  ];

  private readonly overduePaymentAlerts: OverduePaymentAlert[] = [
    {
      id: 'overdue_001',
      customerId: 'customer_002',
      reservationId: 'reservation_001',
      amount: 25000,
      overdueBy: '1 day',
      ownerUserId: 'user_001',
      priority: 'high',
    },
    {
      id: 'overdue_002',
      customerId: 'customer_001',
      reservationId: 'reservation_002',
      amount: 145000,
      overdueBy: 'Due today',
      ownerUserId: 'user_002',
      priority: 'medium',
    },
  ];

  private readonly followUpReminders: FollowUpReminder[] = [
    {
      id: 'followup_001',
      leadId: 'lead_004',
      ownerUserId: 'user_002',
      dueAt: new Date('2026-06-30T19:00:00.000Z').toISOString(),
      reason: 'New lead has not been contacted',
      channel: 'sms',
      priority: 'medium',
    },
    {
      id: 'followup_002',
      leadId: 'lead_003',
      ownerUserId: 'user_001',
      dueAt: new Date('2026-07-01T14:00:00.000Z').toISOString(),
      reason: 'Proposal follow-up after legal review',
      channel: 'email',
      priority: 'high',
    },
  ];

  private readonly reportCatalog: ReportCatalogEntry[] = [
    {
      id: 'sales-dashboard',
      name: 'Sales Dashboard',
      description:
        'Booked revenue, collected payments, and sales productivity at a glance.',
      folder: 'Sales Metrics Reports',
      href: '/reports/sales',
      lastAccessedAt: '2026-06-29',
      createdBy: null,
    },
    {
      id: 'agent-performance',
      name: 'Agent Performance',
      description:
        'Leads, visits, reservations, and revenue contributed by each sales agent.',
      folder: 'Sales Metrics Reports',
      href: '/reports/agents',
      lastAccessedAt: '2026-06-28',
      createdBy: null,
    },
    {
      id: 'revenue-by-period',
      name: 'Revenue by Period',
      description:
        'Monthly booked, collected, outstanding, and forecast revenue.',
      folder: 'Revenue Reports',
      href: '/reports/revenue',
      lastAccessedAt: '2026-06-30',
      createdBy: null,
    },
    {
      id: 'inventory-status',
      name: 'Inventory Status',
      description:
        'Unit availability, reservations, and sales across active projects.',
      folder: 'Inventory Reports',
      href: '/reports/inventory',
      lastAccessedAt: null,
      createdBy: null,
    },
    {
      id: 'lead-conversion-funnel',
      name: 'Lead Conversion Funnel',
      description:
        'Stage-by-stage conversion and drop-off from lead to signed contract.',
      folder: 'Sales Metrics Reports',
      href: '/reports/conversion',
      lastAccessedAt: null,
      createdBy: null,
    },
    {
      id: 'payment-aging',
      name: 'Payment Aging',
      description:
        'Outstanding invoices bucketed by age with collection risk levels.',
      folder: 'Revenue Reports',
      href: '/reports/payment-aging',
      lastAccessedAt: null,
      createdBy: null,
    },
  ];

  private readonly salesDashboardReport: ReportMetric[] = [
    {
      label: 'Booked revenue',
      value: '$4.2M',
      detail: 'Across active reservations',
    },
    { label: 'Collected', value: '$1.1M', detail: '26% of booked revenue' },
    { label: 'Open pipeline', value: '$7.8M', detail: 'Weighted at $3.9M' },
    { label: 'Conversion', value: '18.4%', detail: 'Lead to reservation' },
  ];

  private readonly agentPerformanceReport: AgentPerformanceReport[] = [
    {
      agent: 'Maya Johnson',
      leads: 18,
      visits: 9,
      reservations: 4,
      revenue: 2400000,
      conversionRate: 22,
    },
    {
      agent: 'Omar Haddad',
      leads: 24,
      visits: 12,
      reservations: 5,
      revenue: 1800000,
      conversionRate: 21,
    },
    {
      agent: 'Noah Smith',
      leads: 16,
      visits: 8,
      reservations: 2,
      revenue: 920000,
      conversionRate: 13,
    },
  ];

  private readonly revenueReportRows: RevenueReportRow[] = [
    {
      period: '2026-06',
      booked: 1900000,
      collected: 720000,
      outstanding: 1180000,
      forecast: 2300000,
    },
    {
      period: '2026-07',
      booked: 1400000,
      collected: 280000,
      outstanding: 1120000,
      forecast: 2700000,
    },
    {
      period: '2026-08',
      booked: 900000,
      collected: 100000,
      outstanding: 800000,
      forecast: 2100000,
    },
  ];

  private readonly inventoryReportRows: InventoryReportRow[] = [
    {
      project: 'Harbor Point',
      totalUnits: 184,
      available: 47,
      reserved: 18,
      sold: 104,
      blocked: 15,
    },
    {
      project: 'Meridian Residences',
      totalUnits: 96,
      available: 22,
      reserved: 9,
      sold: 58,
      blocked: 7,
    },
    {
      project: 'District 7 Offices',
      totalUnits: 58,
      available: 58,
      reserved: 0,
      sold: 0,
      blocked: 0,
    },
  ];

  private readonly conversionReportRows: ConversionReportRow[] = [
    { stage: 'Lead captured', count: 248, rate: 100, dropOff: 0 },
    { stage: 'Qualified', count: 142, rate: 57, dropOff: 43 },
    { stage: 'Site visit', count: 76, rate: 31, dropOff: 46 },
    { stage: 'Reservation', count: 46, rate: 18, dropOff: 39 },
    { stage: 'Contract signed', count: 32, rate: 13, dropOff: 30 },
  ];

  private readonly paymentAgingReportRows: PaymentAgingReportRow[] = [
    { bucket: 'Current', invoices: 12, amount: 680000, risk: 'low' },
    { bucket: '1-15 days', invoices: 5, amount: 240000, risk: 'medium' },
    { bucket: '16-30 days', invoices: 2, amount: 95000, risk: 'medium' },
    { bucket: '31+ days', invoices: 1, amount: 25000, risk: 'high' },
  ];

  private readonly subscriptionPlans: SubscriptionPlan[] = [
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

  private readonly featureLimits: FeatureLimit[] = [
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

  private readonly brandingSettings: BrandingSetting[] = [
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

  private readonly tenantBillingItems: TenantBillingItem[] = [
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

  private readonly tenantDomains: TenantDomain[] = [
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

  private readonly dataTransferJobs: DataTransferJob[] = [
    {
      id: 'export_001',
      type: 'export',
      scope: 'Customers and deals',
      requestedByUserId: 'user_001',
      requestedAt: new Date('2026-06-30T12:10:00.000Z').toISOString(),
      status: 'ready',
    },
    {
      id: 'import_001',
      type: 'import',
      scope: 'Legacy leads CSV',
      requestedByUserId: 'user_002',
      requestedAt: new Date('2026-06-29T12:10:00.000Z').toISOString(),
      status: 'processing',
    },
  ];

  private readonly featureFlags: FeatureFlag[] = [
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

  private readonly onboardingSteps: OnboardingStep[] = [
    {
      step: 'Create tenant workspace',
      owner: 'Platform',
      status: 'Complete',
      due: 'Done',
    },
    {
      step: 'Invite admin users',
      owner: 'Tenant admin',
      status: 'Complete',
      due: 'Done',
    },
    {
      step: 'Configure roles and permissions',
      owner: 'Tenant admin',
      status: 'In progress',
      due: '2026-07-02',
    },
    {
      step: 'Publish branding and domain',
      owner: 'Brand admin',
      status: 'In progress',
      due: '2026-07-03',
    },
    {
      step: 'Import leads and inventory from Excel',
      owner: 'Sales ops',
      status: 'Not started',
      due: '2026-07-05',
    },
    {
      step: 'Enable automation and portal',
      owner: 'Operations',
      status: 'Blocked',
      due: 'Needs DNS',
    },
  ];

  private readonly excelImportTemplates: ExcelImportTemplate[] = [
    {
      template: 'Lead import workbook',
      entity: 'Leads',
      requiredColumns: ['firstName', 'lastName', 'phone', 'source', 'budget'],
      lastRun: 'Yesterday',
      status: 'Ready',
    },
    {
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
    {
      template: 'Payment schedule workbook',
      entity: 'Payments',
      requiredColumns: [
        'contractRef',
        'dueDate',
        'amount',
        'installmentNumber',
      ],
      lastRun: 'Never',
      status: 'Ready',
    },
  ];

  private readonly trialPeriod: TrialPeriod = {
    status: 'Active',
    startedAt: '2026-06-26',
    endsAt: '2026-07-10',
    daysRemaining: 9,
    conversionOwner: 'Maya Johnson',
  };

  private readonly billingAccount: BillingAccount = {
    accountName: 'BetFlow Realty LLC',
    billingEmail: 'finance@betflowrealty.com',
    taxId: 'US-88214-CRM',
    paymentMethod: 'Visa ending 4242',
    collectionMode: 'Auto-charge',
    nextCharge: '2026-07-31',
  };

  registerTenant(input: RegisterTenantInput) {
    const ownerRoleId = this.nextId('role');
    const ownerUserId = this.nextId('user');
    const tenant: Tenant = {
      id: this.nextId('tenant'),
      name: input.companyName,
      slug: input.slug,
      region: input.region ?? 'US East',
      plan: input.plan ?? 'Starter',
      status: 'active',
      ownerUserId,
    };
    const ownerRole: Role = {
      id: ownerRoleId,
      name: 'Owner',
      description: 'Full tenant administration access.',
      permissionKeys: this.permissions.map((permission) => permission.key),
    };
    const owner: User = {
      id: ownerUserId,
      name: input.ownerName,
      email: input.ownerEmail,
      roleId: ownerRoleId,
      status: 'active',
    };

    this.tenants.push(tenant);
    this.roles.push(ownerRole);
    this.users.push(owner);
    this.recordAudit({
      actor: owner.name,
      action: 'Registered tenant',
      target: tenant.name,
      severity: 'info',
    });

    return { tenant, owner, roles: [ownerRole] };
  }

  listTenants() {
    return this.tenants;
  }

  getTenant(id: string) {
    const tenant = this.tenants.find((item) => item.id === id);

    if (!tenant) {
      throw new NotFoundException(`Tenant ${id} was not found`);
    }

    return tenant;
  }

  updateTenant(id: string, input: UpdateTenantInput) {
    const tenant = this.getTenant(id);
    Object.assign(tenant, input);
    this.recordAudit({
      actor: 'System',
      action: 'Updated tenant settings',
      target: tenant.name,
      severity: 'info',
    });
    return tenant;
  }

  listUsers() {
    return this.users;
  }

  inviteUser(input: InviteUserInput) {
    const role = this.roles.find((item) => item.id === input.roleId);

    if (!role) {
      throw new NotFoundException(`Role ${input.roleId} was not found`);
    }

    const user: User = {
      id: this.nextId('user'),
      name: input.name,
      email: input.email,
      roleId: input.roleId,
      status: 'invited',
    };

    this.users.push(user);
    this.recordAudit({
      actor: 'System',
      action: 'Invited user',
      target: input.email,
      severity: 'info',
    });
    return user;
  }

  listRoles() {
    return this.roles;
  }

  createRole(input: Omit<Role, 'id'>) {
    const role: Role = { ...input, id: this.nextId('role') };
    this.roles.push(role);
    this.recordAudit({
      actor: 'System',
      action: 'Created role',
      target: role.name,
      severity: 'info',
    });
    return role;
  }

  listPermissions() {
    return this.permissions;
  }

  listAuditLogs() {
    return this.auditLogs;
  }

  recordAudit(input: Omit<AuditLog, 'id' | 'createdAt'>) {
    const log: AuditLog = {
      ...input,
      id: this.nextId('audit'),
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    return log;
  }

  listLeads() {
    return this.leads;
  }

  createLead(input: CreateLeadInput) {
    const lead: Lead = { ...input, id: this.nextId('lead') };
    this.leads.push(lead);
    this.recordActivity({
      actorUserId: input.assignedToUserId ?? 'system',
      action: 'Created lead',
      target: lead.id,
      type: 'assignment',
    });
    return lead;
  }

  assignLead(id: string, assignedToUserId: string) {
    const lead = this.leads.find((item) => item.id === id);

    if (!lead) {
      throw new NotFoundException(`Lead ${id} was not found`);
    }

    lead.assignedToUserId = assignedToUserId;
    this.recordActivity({
      actorUserId: assignedToUserId,
      action: 'Assigned lead',
      target: lead.id,
      type: 'assignment',
    });
    return lead;
  }

  listCustomers() {
    return this.customers;
  }

  createCustomer(input: CreateCustomerInput) {
    const customer: Customer = { ...input, id: this.nextId('customer') };
    this.customers.push(customer);
    return customer;
  }

  listDeals() {
    return this.deals;
  }

  createDeal(input: CreateDealInput) {
    const deal: Deal = { ...input, id: this.nextId('deal') };
    this.deals.push(deal);
    this.recordActivity({
      actorUserId: input.ownerUserId,
      action: 'Created deal',
      target: deal.id,
      type: 'deal',
    });
    return deal;
  }

  moveDeal(id: string, stage: LeadStage) {
    const deal = this.deals.find((item) => item.id === id);

    if (!deal) {
      throw new NotFoundException(`Deal ${id} was not found`);
    }

    deal.stage = stage;
    this.recordActivity({
      actorUserId: deal.ownerUserId,
      action: `Moved deal to ${stage}`,
      target: deal.id,
      type: 'deal',
    });
    return deal;
  }

  listTasks() {
    return this.tasks;
  }

  createTask(input: CreateTaskInput) {
    const task: Task = { ...input, id: this.nextId('task') };
    this.tasks.push(task);
    this.recordActivity({
      actorUserId: input.ownerUserId,
      action: 'Created task',
      target: task.id,
      type: 'task',
    });
    return task;
  }

  listNotes() {
    return this.notes;
  }

  createNote(input: CreateNoteInput) {
    const note: Note = {
      ...input,
      id: this.nextId('note'),
      createdAt: new Date().toISOString(),
    };
    this.notes.push(note);
    this.recordActivity({
      actorUserId: input.authorUserId,
      action: 'Added note',
      target: input.relatedTo,
      type: 'note',
    });
    return note;
  }

  listActivities() {
    return this.activities;
  }

  recordActivity(input: CreateActivityInput) {
    const activity: Activity = {
      ...input,
      id: this.nextId('activity'),
      createdAt: new Date().toISOString(),
    };
    this.activities.unshift(activity);
    return activity;
  }

  listProjects() {
    return this.projects;
  }

  createProject(input: CreateProjectInput) {
    const project: Project = { ...input, id: this.nextId('project') };
    this.projects.push(project);
    return project;
  }

  listBuildings(projectId?: string) {
    return this.buildings.filter((building) => {
      return !projectId || building.projectId === projectId;
    });
  }

  createBuilding(input: CreateBuildingInput) {
    const building: Building = { ...input, id: this.nextId('building') };
    this.buildings.push(building);
    return building;
  }

  listFloors(buildingId?: string) {
    return this.floors.filter((floor) => {
      return !buildingId || floor.buildingId === buildingId;
    });
  }

  createFloor(input: CreateFloorInput) {
    const floor: Floor = { ...input, id: this.nextId('floor') };
    this.floors.push(floor);
    return floor;
  }

  listUnits(status?: UnitStatus) {
    return this.units.filter((unit) => {
      return !status || unit.status === status;
    });
  }

  createUnit(input: CreateUnitInput) {
    const unit: Unit = { ...input, id: this.nextId('unit') };
    this.units.push(unit);
    return unit;
  }

  updateUnitStatus(id: string, status: UnitStatus, availableFrom?: string) {
    const unit = this.units.find((item) => item.id === id);

    if (!unit) {
      throw new NotFoundException(`Unit ${id} was not found`);
    }

    unit.status = status;
    if (availableFrom) {
      unit.availableFrom = availableFrom;
    }
    return unit;
  }

  listPropertyMedia(projectId?: string) {
    return this.propertyMedia.filter((media) => {
      return !projectId || media.projectId === projectId;
    });
  }

  createPropertyMedia(input: CreatePropertyMediaInput) {
    const media: PropertyMedia = {
      ...input,
      id: this.nextId('media'),
      updatedAt: new Date().toISOString(),
    };
    this.propertyMedia.push(media);
    return media;
  }

  listSiteVisits() {
    return this.siteVisits;
  }

  createSiteVisit(input: CreateSiteVisitInput) {
    const visit: SiteVisit = { ...input, id: this.nextId('visit') };
    this.siteVisits.push(visit);
    return visit;
  }

  updateSiteVisitStatus(id: string, status: SiteVisit['status']) {
    const visit = this.siteVisits.find((item) => item.id === id);

    if (!visit) {
      throw new NotFoundException(`Site visit ${id} was not found`);
    }

    visit.status = status;

    return visit;
  }

  listReservations() {
    return this.reservations;
  }

  createReservation(input: CreateReservationInput) {
    const reservation: Reservation = {
      ...input,
      id: this.nextId('reservation'),
    };
    this.reservations.push(reservation);
    this.updateUnitStatus(input.unitId, 'reserved', input.expiresAt);
    return reservation;
  }

  updateReservationStatus(id: string, status: Reservation['status']) {
    const reservation = this.reservations.find((item) => item.id === id);

    if (!reservation) {
      throw new NotFoundException(`Reservation ${id} was not found`);
    }

    reservation.status = status;
    if (status === 'reserved') {
      this.updateUnitStatus(
        reservation.unitId,
        'reserved',
        reservation.expiresAt,
      );
    }
    if (status === 'expired') {
      this.updateUnitStatus(reservation.unitId, 'available');
    }
    return reservation;
  }

  listPaymentSchedule(reservationId?: string) {
    return this.paymentSchedule.filter((item) => {
      return !reservationId || item.reservationId === reservationId;
    });
  }

  createPaymentScheduleItem(input: CreatePaymentScheduleInput) {
    const item: PaymentScheduleItem = {
      ...input,
      id: this.nextId('schedule'),
    };
    this.paymentSchedule.push(item);
    return item;
  }

  listPaymentTransactions(reservationId?: string) {
    return this.paymentTransactions.filter((payment) => {
      return !reservationId || payment.reservationId === reservationId;
    });
  }

  createPaymentTransaction(input: CreatePaymentTransactionInput) {
    const payment: PaymentTransaction = {
      ...input,
      id: this.nextId('payment'),
    };
    this.paymentTransactions.push(payment);
    return payment;
  }

  listReceiptUploads(paymentId?: string) {
    return this.receiptUploads.filter((receipt) => {
      return !paymentId || receipt.paymentId === paymentId;
    });
  }

  createReceiptUpload(input: CreateReceiptUploadInput) {
    const receipt: ReceiptUpload = {
      ...input,
      id: this.nextId('receipt'),
      uploadedAt: new Date().toISOString(),
    };
    this.receiptUploads.push(receipt);
    return receipt;
  }

  listFinanceApprovals() {
    return this.financeApprovals;
  }

  createFinanceApproval(input: CreateFinanceApprovalInput) {
    const approval: FinanceApproval = {
      ...input,
      id: this.nextId('approval'),
      submittedAt: new Date().toISOString(),
    };
    this.financeApprovals.push(approval);
    return approval;
  }

  updateFinanceApprovalStatus(id: string, status: FinanceApproval['status']) {
    const approval = this.financeApprovals.find((item) => item.id === id);

    if (!approval) {
      throw new NotFoundException(`Finance approval ${id} was not found`);
    }

    approval.status = status;

    return approval;
  }

  listUploadedDocuments() {
    return this.uploadedDocuments;
  }

  createUploadedDocument(input: CreateUploadedDocumentInput) {
    const document: UploadedDocument = {
      ...input,
      id: this.nextId('document'),
      uploadedAt: new Date().toISOString(),
    };
    this.uploadedDocuments.push(document);
    return document;
  }

  updateUploadedDocumentStatus(id: string, status: UploadedDocument['status']) {
    const document = this.uploadedDocuments.find((item) => item.id === id);

    if (!document) {
      throw new NotFoundException(`Document ${id} was not found`);
    }

    document.status = status;
    return document;
  }

  listContractTemplates() {
    return this.contractTemplates;
  }

  createContractTemplate(input: CreateContractTemplateInput) {
    const template: ContractTemplate = {
      ...input,
      id: this.nextId('template'),
      updatedAt: new Date().toISOString(),
    };
    this.contractTemplates.push(template);
    return template;
  }

  listGeneratedContractPdfs() {
    return this.generatedContractPdfs;
  }

  generateContractPdf(input: CreateGeneratedContractPdfInput) {
    const pdf: GeneratedContractPdf = {
      ...input,
      id: this.nextId('contract_pdf'),
      generatedAt: new Date().toISOString(),
    };
    this.generatedContractPdfs.push(pdf);
    return pdf;
  }

  listLegalContractApprovals() {
    return this.legalContractApprovals;
  }

  createLegalContractApproval(input: CreateLegalContractApprovalInput) {
    const approval: LegalContractApproval = {
      ...input,
      id: this.nextId('contract_approval'),
      submittedAt: new Date().toISOString(),
    };
    this.legalContractApprovals.push(approval);
    return approval;
  }

  updateLegalContractApprovalStatus(
    id: string,
    status: LegalContractApproval['status'],
  ) {
    const approval = this.legalContractApprovals.find((item) => item.id === id);

    if (!approval) {
      throw new NotFoundException(`Legal approval ${id} was not found`);
    }

    approval.status = status;

    return approval;
  }

  listSignedContracts() {
    return this.signedContracts;
  }

  createSignedContract(input: CreateSignedContractInput) {
    const contract: SignedContract = {
      ...input,
      id: this.nextId('signed_contract'),
    };
    this.signedContracts.push(contract);
    return contract;
  }

  listNotificationMessages(channel?: NotificationMessage['channel']) {
    return this.notificationMessages.filter((message) => {
      return !channel || message.channel === channel;
    });
  }

  createNotificationMessage(input: CreateNotificationMessageInput) {
    const message: NotificationMessage = {
      ...input,
      id: this.nextId('notification'),
    };
    this.notificationMessages.push(message);
    return message;
  }

  updateNotificationStatus(id: string, status: NotificationMessage['status']) {
    const message = this.notificationMessages.find((item) => item.id === id);

    if (!message) {
      throw new NotFoundException(`Notification ${id} was not found`);
    }

    message.status = status;
    return message;
  }

  listOverduePaymentAlerts() {
    return this.overduePaymentAlerts;
  }

  createOverduePaymentAlert(input: CreateOverduePaymentAlertInput) {
    const alert: OverduePaymentAlert = {
      ...input,
      id: this.nextId('overdue'),
    };
    this.overduePaymentAlerts.push(alert);
    return alert;
  }

  listFollowUpReminders() {
    return this.followUpReminders;
  }

  createFollowUpReminder(input: CreateFollowUpReminderInput) {
    const reminder: FollowUpReminder = {
      ...input,
      id: this.nextId('followup'),
    };
    this.followUpReminders.push(reminder);
    return reminder;
  }

  getReportsCatalog() {
    return this.reportCatalog;
  }

  getSalesDashboardReport() {
    return this.salesDashboardReport;
  }

  getAgentPerformanceReport() {
    return this.agentPerformanceReport;
  }

  getRevenueReport() {
    return this.revenueReportRows;
  }

  getInventoryReport() {
    return this.inventoryReportRows;
  }

  getConversionReport() {
    return this.conversionReportRows;
  }

  getPaymentAgingReport() {
    return this.paymentAgingReportRows;
  }

  listSubscriptionPlans() {
    return this.subscriptionPlans;
  }

  listFeatureLimits() {
    return this.featureLimits;
  }

  listBrandingSettings() {
    return this.brandingSettings;
  }

  updateBrandingSetting(
    id: string,
    value: string,
    status?: BrandingSetting['status'],
  ) {
    const setting = this.brandingSettings.find((item) => item.id === id);

    if (!setting) {
      throw new NotFoundException(`Branding setting ${id} was not found`);
    }

    setting.value = value;
    if (status) {
      setting.status = status;
    }
    return setting;
  }

  publishBrandingSettings() {
    for (const setting of this.brandingSettings) {
      setting.status = 'live';
    }
    return this.brandingSettings;
  }

  listTenantBillingItems() {
    return this.tenantBillingItems;
  }

  listTenantDomains() {
    return this.tenantDomains;
  }

  createTenantDomain(input: CreateTenantDomainInput) {
    const domain: TenantDomain = {
      ...input,
      id: this.nextId('domain'),
      status: 'pending_dns',
      ssl: 'pending',
      target: 'tenant.betflow.app',
    };
    this.tenantDomains.push(domain);
    return domain;
  }

  deleteTenantDomain(id: string) {
    const idx = this.tenantDomains.findIndex((item) => item.id === id);
    if (idx !== -1) {
      this.tenantDomains.splice(idx, 1);
    }
    return { success: true };
  }

  listFeatureFlags() {
    return this.featureFlags;
  }

  toggleFeatureFlag(key: string, enabled: boolean) {
    const flag = this.featureFlags.find((item) => item.key === key);
    if (!flag) {
      throw new NotFoundException(`Feature flag ${key} was not found`);
    }
    flag.enabled = enabled;
    return flag;
  }

  listOnboardingSteps() {
    return this.onboardingSteps;
  }

  updateOnboardingStep(stepName: string, status: OnboardingStep['status']) {
    const step = this.onboardingSteps.find((item) => item.step === stepName);
    if (!step) {
      throw new NotFoundException(`Onboarding step ${stepName} was not found`);
    }
    step.status = status;
    return step;
  }

  listExcelImportTemplates() {
    return this.excelImportTemplates;
  }

  getTrialPeriod() {
    return this.trialPeriod;
  }

  getBillingAccount() {
    return this.billingAccount;
  }

  updateBillingAccount(input: Partial<BillingAccount>) {
    Object.assign(this.billingAccount, input);
    return this.billingAccount;
  }

  listDataTransferJobs() {
    return this.dataTransferJobs;
  }

  createDataTransferJob(input: CreateDataTransferJobInput) {
    const job: DataTransferJob = {
      ...input,
      id: this.nextId(input.type),
      requestedAt:
        'Today, ' +
        new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
      status: 'ready',
    };
    this.dataTransferJobs.unshift(job);
    return job;
  }

  private nextId(prefix: string) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
