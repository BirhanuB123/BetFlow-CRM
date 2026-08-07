export type SubscriptionPlan = {
  id: string;
  name: string;
  price: string;
  billingCycle: "Monthly" | "Annual";
  status: "Current" | "Available";
  trialDays: number;
  overagePolicy: string;
  includes: string[];
};

export type FeatureLimit = {
  feature: string;
  used: number;
  limit: number;
  unit: string;
  reset: string;
};

export type BrandingSetting = {
  label: string;
  value: string;
  status: "Live" | "Draft";
};

export type BillingItem = {
  invoice: string;
  period: string;
  amount: string;
  status: "Paid" | "Due" | "Failed";
  dueDate: string;
};

export type CustomDomain = {
  domain: string;
  status: "Verified" | "Pending DNS" | "Failed";
  ssl: "Active" | "Pending";
  target: string;
};

export type DataTransferJob = {
  id: string;
  type: "Export" | "Import" | "Excel import";
  scope: string;
  requestedBy: string;
  requestedAt: string;
  status: "Ready" | "Processing" | "Failed";
};

export type TrialPeriod = {
  status: "Active" | "Expired" | "Converted";
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
  collectionMode: "Auto-charge" | "Invoice";
  nextCharge: string;
};

export type FeatureFlag = {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  scope: "Tenant" | "Plan" | "Beta cohort";
  rollout: string;
};

export type OnboardingStep = {
  step: string;
  owner: string;
  status: "Complete" | "In progress" | "Blocked" | "Not started";
  due: string;
};

export type ExcelImportTemplate = {
  template: string;
  entity: "Leads" | "Customers" | "Units" | "Payments";
  requiredColumns: string[];
  lastRun: string;
  status: "Ready" | "Processing" | "Failed";
};

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "plan_growth",
    name: "Growth",
    price: "$499",
    billingCycle: "Monthly",
    status: "Current",
    trialDays: 14,
    overagePolicy: "$15/user, $0.08/lead",
    includes: [
      "25 users",
      "500 active leads",
      "3 custom domains",
      "API access",
    ],
  },
  {
    id: "plan_scale",
    name: "Scale",
    price: "$899",
    billingCycle: "Monthly",
    status: "Available",
    trialDays: 14,
    overagePolicy: "$12/user, $0.05/lead",
    includes: [
      "75 users",
      "2,000 active leads",
      "10 custom domains",
      "Priority support",
    ],
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    price: "Custom",
    billingCycle: "Annual",
    status: "Available",
    trialDays: 30,
    overagePolicy: "Contracted limits",
    includes: [
      "Unlimited users",
      "Dedicated tenant controls",
      "SAML SSO",
      "Data residency",
    ],
  },
];

export const featureLimits: FeatureLimit[] = [
  {
    feature: "Users",
    used: 24,
    limit: 25,
    unit: "seats",
    reset: "Billing cycle",
  },
  {
    feature: "Active leads",
    used: 248,
    limit: 500,
    unit: "leads",
    reset: "Rolling",
  },
  { feature: "Storage", used: 82, limit: 250, unit: "GB", reset: "Never" },
  {
    feature: "Custom domains",
    used: 1,
    limit: 3,
    unit: "domains",
    reset: "Never",
  },
  {
    feature: "Monthly exports",
    used: 6,
    limit: 20,
    unit: "jobs",
    reset: "Jul 31, 2026",
  },
  {
    feature: "Excel import rows",
    used: 18400,
    limit: 50000,
    unit: "rows",
    reset: "Jul 31, 2026",
  },
  {
    feature: "Automation messages",
    used: 27420,
    limit: 50000,
    unit: "messages",
    reset: "Jul 31, 2026",
  },
];

export const brandingSettings: BrandingSetting[] = [
  { label: "Workspace name", value: "BetFlow Realty", status: "Live" },
  { label: "Primary color", value: "#18181b", status: "Live" },
  { label: "Accent color", value: "#0f766e", status: "Live" },
  { label: "Logo", value: "betflow_logo.svg", status: "Live" },
  { label: "Favicon", value: "tenant_favicon.ico", status: "Draft" },
  { label: "Email sender name", value: "BetFlow Realty Sales", status: "Live" },
  {
    label: "Portal domain",
    value: "portal.betflowrealty.com",
    status: "Draft",
  },
  {
    label: "Login message",
    value: "Welcome to BetFlow Realty",
    status: "Draft",
  },
];

export const billingItems: BillingItem[] = [
  {
    invoice: "INV-2026-006",
    period: "June 2026",
    amount: "$499",
    status: "Paid",
    dueDate: "Jun 30, 2026",
  },
  {
    invoice: "INV-2026-007",
    period: "July 2026",
    amount: "$499",
    status: "Due",
    dueDate: "Jul 31, 2026",
  },
  {
    invoice: "ADD-2026-012",
    period: "Storage overage",
    amount: "$42",
    status: "Due",
    dueDate: "Jul 31, 2026",
  },
];

export const customDomains: CustomDomain[] = [
  {
    domain: "crm.betflowrealty.com",
    status: "Verified",
    ssl: "Active",
    target: "tenant.betflow.app",
  },
  {
    domain: "sales.betflowrealty.com",
    status: "Pending DNS",
    ssl: "Pending",
    target: "tenant.betflow.app",
  },
  {
    domain: "portal.betflowrealty.com",
    status: "Pending DNS",
    ssl: "Pending",
    target: "portal.betflow.app",
  },
];

export const dataTransferJobs: DataTransferJob[] = [
  {
    id: "export_001",
    type: "Export",
    scope: "Customers and deals",
    requestedBy: "Maya Johnson",
    requestedAt: "Today, 8:10 AM",
    status: "Ready",
  },
  {
    id: "import_001",
    type: "Import",
    scope: "Legacy leads CSV",
    requestedBy: "Omar Haddad",
    requestedAt: "Yesterday",
    status: "Processing",
  },
  {
    id: "excel_001",
    type: "Excel import",
    scope: "Tower A unit inventory",
    requestedBy: "Lina Park",
    requestedAt: "Today, 10:25 AM",
    status: "Ready",
  },
  {
    id: "export_002",
    type: "Export",
    scope: "Audit logs",
    requestedBy: "Lina Park",
    requestedAt: "Jun 29, 2026",
    status: "Ready",
  },
];

export const saasMetrics = [
  { label: "Current plan", value: "Growth", detail: "$499 monthly" },
  { label: "Seat usage", value: "24/25", detail: "1 seat remaining" },
  { label: "Trial", value: "9 days", detail: "Converts Jul 10, 2026" },
  { label: "Domains", value: "1/3", detail: "2 pending DNS" },
  { label: "Imports", value: "18.4K/50K", detail: "Excel rows this cycle" },
];

export const trialPeriod: TrialPeriod = {
  status: "Active",
  startedAt: "Jun 26, 2026",
  endsAt: "Jul 10, 2026",
  daysRemaining: 9,
  conversionOwner: "Maya Johnson",
};

export const billingAccount: BillingAccount = {
  accountName: "BetFlow Realty LLC",
  billingEmail: "finance@betflowrealty.com",
  taxId: "US-88214-CRM",
  paymentMethod: "Visa ending 4242",
  collectionMode: "Auto-charge",
  nextCharge: "Jul 31, 2026",
};

export const featureFlags: FeatureFlag[] = [
  {
    key: "customer_portal",
    label: "Customer portal",
    description:
      "Enable buyer login, payment schedules, document downloads, and support requests.",
    enabled: true,
    scope: "Tenant",
    rollout: "100%",
  },
  {
    key: "mobile_pwa",
    label: "Agent mobile PWA",
    description:
      "Allow installable mobile shell, push notifications, and offline visit notes.",
    enabled: false,
    scope: "Beta cohort",
    rollout: "20%",
  },
  {
    key: "advanced_forecasting",
    label: "Advanced forecasting",
    description:
      "Use weighted pipeline, payment schedules, and unit absorption predictions.",
    enabled: true,
    scope: "Plan",
    rollout: "Growth+",
  },
  {
    key: "api_marketplace",
    label: "API marketplace",
    description:
      "Expose webhook subscriptions, partner app scopes, and API keys.",
    enabled: false,
    scope: "Tenant",
    rollout: "Internal preview",
  },
];

export const onboardingSteps: OnboardingStep[] = [
  {
    step: "Create tenant workspace",
    owner: "Platform",
    status: "Complete",
    due: "Done",
  },
  {
    step: "Invite admin users",
    owner: "Tenant admin",
    status: "Complete",
    due: "Done",
  },
  {
    step: "Configure roles and permissions",
    owner: "Tenant admin",
    status: "In progress",
    due: "Jul 2, 2026",
  },
  {
    step: "Publish branding and domain",
    owner: "Brand admin",
    status: "In progress",
    due: "Jul 3, 2026",
  },
  {
    step: "Import leads and inventory from Excel",
    owner: "Sales ops",
    status: "Not started",
    due: "Jul 5, 2026",
  },
  {
    step: "Enable automation and portal",
    owner: "Operations",
    status: "Blocked",
    due: "Needs DNS",
  },
];

export const excelImportTemplates: ExcelImportTemplate[] = [
  {
    template: "Lead import workbook",
    entity: "Leads",
    requiredColumns: ["firstName", "lastName", "phone", "source", "budget"],
    lastRun: "Yesterday",
    status: "Ready",
  },
  {
    template: "Customer import workbook",
    entity: "Customers",
    requiredColumns: ["firstName", "lastName", "email", "phone", "nationalId"],
    lastRun: "Jun 28, 2026",
    status: "Ready",
  },
  {
    template: "Unit inventory workbook",
    entity: "Units",
    requiredColumns: [
      "project",
      "building",
      "floor",
      "unitNumber",
      "price",
      "status",
    ],
    lastRun: "Today",
    status: "Processing",
  },
  {
    template: "Payment schedule workbook",
    entity: "Payments",
    requiredColumns: ["contractRef", "dueDate", "amount", "installmentNumber"],
    lastRun: "Never",
    status: "Ready",
  },
];

export const statusClass = {
  Current: "bg-emerald-50 text-emerald-700",
  Available: "bg-zinc-100 text-zinc-700",
  Live: "bg-emerald-50 text-emerald-700",
  Draft: "bg-amber-50 text-amber-800",
  Paid: "bg-emerald-50 text-emerald-700",
  Due: "bg-amber-50 text-amber-800",
  Failed: "bg-red-50 text-red-700",
  Verified: "bg-emerald-50 text-emerald-700",
  "Pending DNS": "bg-amber-50 text-amber-800",
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-800",
  Ready: "bg-emerald-50 text-emerald-700",
  Processing: "bg-blue-50 text-blue-700",
  Complete: "bg-emerald-50 text-emerald-700",
  "In progress": "bg-blue-50 text-blue-700",
  Blocked: "bg-red-50 text-red-700",
  "Not started": "bg-zinc-100 text-zinc-700",
  Expired: "bg-red-50 text-red-700",
  Converted: "bg-emerald-50 text-emerald-700",
};
