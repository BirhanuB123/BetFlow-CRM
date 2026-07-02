import {
  BookOpen,
  FileSignature,
  LifeBuoy,
  Presentation,
  Video,
  type LucideIcon,
} from "lucide-react";

export type ResourcePageKey =
  | "user-guide"
  | "admin-guide"
  | "training-videos"
  | "sales-deck"
  | "proposal-template"
  | "support-process";

export type ResourcePage = {
  key: ResourcePageKey;
  title: string;
  description: string;
  active: string;
  icon: LucideIcon;
  metrics: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  sections: Array<{
    title: string;
    owner: string;
    status: "Ready" | "Draft" | "Review";
    items: string[];
  }>;
};

export const pricingPlans = [
  {
    name: "Starter",
    price: "$299",
    detail: "For boutique agencies and early-stage sales teams.",
    includes: ["10 users", "250 active leads", "1 custom domain", "Core CRM workflows"],
  },
  {
    name: "Growth",
    price: "$499",
    detail: "For growing real estate operators with automation needs.",
    includes: ["25 users", "500 active leads", "3 custom domains", "Automation and API access"],
    featured: true,
  },
  {
    name: "Scale",
    price: "$899",
    detail: "For multi-project teams with advanced sales operations.",
    includes: ["75 users", "2,000 active leads", "10 custom domains", "Forecasting and priority support"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    detail: "For regional developers and white-label SaaS deployments.",
    includes: ["Unlimited users", "Dedicated tenant controls", "SAML SSO", "Data residency"],
  },
];

export const landingMetrics = [
  { label: "Lead response", value: "42s", detail: "Average assignment time" },
  { label: "Revenue forecast", value: "$8.4M", detail: "Weighted next 90 days" },
  { label: "Automation", value: "28K", detail: "Monthly customer touches" },
  { label: "Tenant controls", value: "100%", detail: "Scoped by tenant and role" },
];

export const launchChecklist = [
  "Demo tenant seeded with CRM, inventory, sales, payments, documents, and audit data.",
  "Tenant registration, JWT login, current user endpoint, and role guards.",
  "SaaS business layer for plans, usage limits, billing, domains, branding, onboarding, and imports.",
  "Enterprise surfaces for website leads, Meta import, follow-up automation, forecasting, portal, and APIs.",
];

export const resourceStatusClass = {
  Ready: "bg-emerald-50 text-emerald-700",
  Draft: "bg-amber-50 text-amber-800",
  Review: "bg-blue-50 text-blue-700",
};

export const resourcePages: Record<ResourcePageKey, ResourcePage> = {
  "user-guide": {
    key: "user-guide",
    title: "User guide",
    description: "Daily operating guide for agents, sales admins, and finance users.",
    active: "User guide",
    icon: BookOpen,
    metrics: [
      { label: "Chapters", value: "8", detail: "CRM, inventory, payments, contracts, and reporting" },
      { label: "Primary audience", value: "Agents", detail: "Sales and customer-facing users" },
      { label: "Format", value: "In-app", detail: "Short workflow playbooks" },
    ],
    sections: [
      {
        title: "Agent workflows",
        owner: "Sales operations",
        status: "Ready",
        items: ["Create and qualify leads", "Assign follow-up tasks", "Log notes and timeline activity", "Move deals through the pipeline"],
      },
      {
        title: "Inventory workflows",
        owner: "Inventory admin",
        status: "Ready",
        items: ["Browse projects and units", "Check unit availability", "Attach property media", "Reserve a unit for a customer"],
      },
      {
        title: "Finance workflows",
        owner: "Finance team",
        status: "Review",
        items: ["Track payment schedules", "Upload receipts", "Approve finance requests", "Review payment aging"],
      },
    ],
  },
  "admin-guide": {
    key: "admin-guide",
    title: "Admin guide",
    description: "Tenant administration guide for setup, RBAC, SaaS controls, and governance.",
    active: "Admin guide",
    icon: BookOpen,
    metrics: [
      { label: "Admin domains", value: "7", detail: "Tenants, users, roles, billing, branding, domains, imports" },
      { label: "Security model", value: "JWT + RBAC", detail: "Tenant-scoped access control" },
      { label: "Audit coverage", value: "Core", detail: "Tenant, auth, user, and role events" },
    ],
    sections: [
      {
        title: "Tenant setup",
        owner: "Platform admin",
        status: "Ready",
        items: ["Register tenant", "Configure tenant profile", "Run onboarding checklist", "Seed initial data"],
      },
      {
        title: "Access control",
        owner: "Security admin",
        status: "Ready",
        items: ["Invite users", "Create roles", "Assign permissions", "Review audit logs"],
      },
      {
        title: "SaaS operations",
        owner: "Tenant admin",
        status: "Draft",
        items: ["Manage plan and usage", "Toggle feature flags", "Publish branding", "Verify custom domains"],
      },
    ],
  },
  "training-videos": {
    key: "training-videos",
    title: "Training videos",
    description: "Structured enablement curriculum for onboarding admins and sales users.",
    active: "Training videos",
    icon: Video,
    metrics: [
      { label: "Videos", value: "9", detail: "Role-based training modules" },
      { label: "Runtime", value: "74m", detail: "Total training path" },
      { label: "Tracks", value: "3", detail: "Agent, manager, admin" },
    ],
    sections: [
      {
        title: "Agent track",
        owner: "Sales enablement",
        status: "Ready",
        items: ["Lead follow-up basics", "Pipeline board workflow", "Site visit and reservation flow"],
      },
      {
        title: "Manager track",
        owner: "Sales leadership",
        status: "Ready",
        items: ["Agent performance reporting", "Forecasting review", "Approval queue handling"],
      },
      {
        title: "Admin track",
        owner: "Customer success",
        status: "Draft",
        items: ["Tenant setup", "Excel import walkthrough", "Feature flag rollout"],
      },
    ],
  },
  "sales-deck": {
    key: "sales-deck",
    title: "Sales deck",
    description: "Buyer-facing deck outline for selling BetFlow CRM to real estate teams.",
    active: "Sales deck",
    icon: Presentation,
    metrics: [
      { label: "Slides", value: "12", detail: "Problem, solution, proof, pricing, implementation" },
      { label: "Audience", value: "Executives", detail: "Developers and brokerages" },
      { label: "Close motion", value: "Demo-first", detail: "Seeded tenant walkthrough" },
    ],
    sections: [
      {
        title: "Narrative",
        owner: "Sales",
        status: "Ready",
        items: ["Fragmented lead sources", "Slow follow-up", "Inventory visibility gaps", "Revenue leakage from manual approvals"],
      },
      {
        title: "Product proof",
        owner: "Solution engineering",
        status: "Ready",
        items: ["Tenant demo", "CRM pipeline", "Inventory availability", "Payment and contract workflow"],
      },
      {
        title: "Commercials",
        owner: "Revenue operations",
        status: "Review",
        items: ["Pricing tiers", "Implementation plan", "Support model", "Proposal next steps"],
      },
    ],
  },
  "proposal-template": {
    key: "proposal-template",
    title: "Proposal template",
    description: "Reusable implementation proposal for tenant onboarding and SaaS subscription sale.",
    active: "Proposal",
    icon: FileSignature,
    metrics: [
      { label: "Sections", value: "10", detail: "Scope, timeline, pricing, assumptions, support" },
      { label: "Implementation", value: "30 days", detail: "Standard launch plan" },
      { label: "Commercial model", value: "SaaS + setup", detail: "Subscription, onboarding, optional migration" },
    ],
    sections: [
      {
        title: "Scope",
        owner: "Solution consultant",
        status: "Ready",
        items: ["Tenant setup", "User roles", "Inventory import", "CRM workflow configuration"],
      },
      {
        title: "Timeline",
        owner: "Project manager",
        status: "Ready",
        items: ["Week 1 discovery", "Week 2 setup", "Week 3 data import", "Week 4 training and go-live"],
      },
      {
        title: "Terms",
        owner: "Commercial team",
        status: "Review",
        items: ["Monthly subscription", "Implementation fee", "Data migration assumptions", "Support SLA"],
      },
    ],
  },
  "support-process": {
    key: "support-process",
    title: "Support process",
    description: "Support intake, severity levels, escalation, and customer success operating model.",
    active: "Support",
    icon: LifeBuoy,
    metrics: [
      { label: "Channels", value: "4", detail: "Portal, email, WhatsApp, phone escalation" },
      { label: "Severity levels", value: "4", detail: "Critical through low" },
      { label: "First response", value: "2h", detail: "Business-hours target" },
    ],
    sections: [
      {
        title: "Intake",
        owner: "Support desk",
        status: "Ready",
        items: ["Customer portal request", "Email ticket", "WhatsApp support queue", "Internal admin escalation"],
      },
      {
        title: "SLA",
        owner: "Customer success",
        status: "Ready",
        items: ["Critical: 30 minutes", "High: 2 hours", "Normal: 1 business day", "Low: 3 business days"],
      },
      {
        title: "Escalation",
        owner: "Engineering support",
        status: "Draft",
        items: ["Reproduce issue", "Classify tenant impact", "Patch or workaround", "Post-incident summary"],
      },
    ],
  },
};

export const demoCredentials = {
  tenant: "betflow-crm",
  email: "admin@betflow.example",
  password: "admin123",
};
