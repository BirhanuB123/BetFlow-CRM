export type SubscriptionPlan = {
  id: string;
  name: string;
  price: string;
  billingCycle: "Monthly" | "Annual";
  status: "Current" | "Available";
  includes: string[];
};

export type FeatureLimit = {
  feature: string;
  used: number;
  limit: number;
  unit: string;
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
  type: "Export" | "Import";
  scope: string;
  requestedBy: string;
  requestedAt: string;
  status: "Ready" | "Processing" | "Failed";
};

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "plan_growth",
    name: "Growth",
    price: "$499",
    billingCycle: "Monthly",
    status: "Current",
    includes: ["25 users", "500 active leads", "3 custom domains", "API access"],
  },
  {
    id: "plan_scale",
    name: "Scale",
    price: "$899",
    billingCycle: "Monthly",
    status: "Available",
    includes: ["75 users", "2,000 active leads", "10 custom domains", "Priority support"],
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    price: "Custom",
    billingCycle: "Annual",
    status: "Available",
    includes: ["Unlimited users", "Dedicated tenant controls", "SAML SSO", "Data residency"],
  },
];

export const featureLimits: FeatureLimit[] = [
  { feature: "Users", used: 24, limit: 25, unit: "seats" },
  { feature: "Active leads", used: 248, limit: 500, unit: "leads" },
  { feature: "Storage", used: 82, limit: 250, unit: "GB" },
  { feature: "Custom domains", used: 1, limit: 3, unit: "domains" },
  { feature: "Monthly exports", used: 6, limit: 20, unit: "jobs" },
];

export const brandingSettings: BrandingSetting[] = [
  { label: "Workspace name", value: "BetFlow Realty", status: "Live" },
  { label: "Primary color", value: "#18181b", status: "Live" },
  { label: "Logo", value: "betflow_logo.svg", status: "Live" },
  { label: "Login message", value: "Welcome to BetFlow Realty", status: "Draft" },
];

export const billingItems: BillingItem[] = [
  { invoice: "INV-2026-006", period: "June 2026", amount: "$499", status: "Paid", dueDate: "Jun 30, 2026" },
  { invoice: "INV-2026-007", period: "July 2026", amount: "$499", status: "Due", dueDate: "Jul 31, 2026" },
  { invoice: "ADD-2026-012", period: "Storage overage", amount: "$42", status: "Due", dueDate: "Jul 31, 2026" },
];

export const customDomains: CustomDomain[] = [
  { domain: "crm.betflowrealty.com", status: "Verified", ssl: "Active", target: "tenant.betflow.app" },
  { domain: "sales.betflowrealty.com", status: "Pending DNS", ssl: "Pending", target: "tenant.betflow.app" },
];

export const dataTransferJobs: DataTransferJob[] = [
  { id: "export_001", type: "Export", scope: "Customers and deals", requestedBy: "Maya Johnson", requestedAt: "Today, 8:10 AM", status: "Ready" },
  { id: "import_001", type: "Import", scope: "Legacy leads CSV", requestedBy: "Omar Haddad", requestedAt: "Yesterday", status: "Processing" },
  { id: "export_002", type: "Export", scope: "Audit logs", requestedBy: "Lina Park", requestedAt: "Jun 29, 2026", status: "Ready" },
];

export const saasMetrics = [
  { label: "Current plan", value: "Growth", detail: "$499 monthly" },
  { label: "Seat usage", value: "24/25", detail: "1 seat remaining" },
  { label: "Domains", value: "1/3", detail: "1 pending DNS" },
  { label: "Exports", value: "6/20", detail: "This billing cycle" },
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
};
