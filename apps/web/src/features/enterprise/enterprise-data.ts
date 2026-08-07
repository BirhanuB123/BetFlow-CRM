export type EnterpriseCapabilityKey =
  | "website-leads"
  | "social-leads"
  | "follow-up-automation"
  | "email-campaigns"
  | "customer-portal"
  | "mobile-pwa"
  | "sales-forecasting"
  | "contract-builder"
  | "approval-workflows"
  | "api-marketplace";

export type EnterpriseCapability = {
  key: EnterpriseCapabilityKey;
  title: string;
  description: string;
  active: string;
  commandLabel: string;
  metrics: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  workflow: Array<{
    step: string;
    owner: string;
    status: "Live" | "Testing" | "Draft" | "Needs setup";
    sla: string;
  }>;
  integrations: Array<{
    name: string;
    type: string;
    health: "Connected" | "Pending" | "Paused" | "Review";
    volume: string;
  }>;
};

export const enterpriseStatusClass = {
  Live: "bg-emerald-50 text-emerald-700",
  Testing: "bg-blue-50 text-blue-700",
  Draft: "bg-zinc-100 text-zinc-700",
  "Needs setup": "bg-amber-50 text-amber-700",
};

export const integrationHealthClass = {
  Connected: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Paused: "bg-zinc-100 text-zinc-700",
  Review: "bg-violet-50 text-violet-700",
};

export const enterpriseCapabilities: Record<
  EnterpriseCapabilityKey,
  EnterpriseCapability
> = {
  "website-leads": {
    key: "website-leads",
    title: "Website lead capture",
    description:
      "Capture, validate, deduplicate, and route website inquiries into the CRM.",
    active: "Website leads",
    commandLabel: "Create form",
    metrics: [
      {
        label: "Embedded forms",
        value: "6",
        detail: "Project, unit, landing, and contact forms",
      },
      {
        label: "Capture rate",
        value: "18.4%",
        detail: "Visitor to lead conversion",
      },
      {
        label: "Duplicates blocked",
        value: "142",
        detail: "Phone and email match rules",
      },
      {
        label: "Avg assignment",
        value: "42s",
        detail: "Lead to agent routing time",
      },
    ],
    workflow: [
      {
        step: "Validate required fields and consent",
        owner: "Growth ops",
        status: "Live",
        sla: "< 1s",
      },
      {
        step: "Match duplicate lead profiles",
        owner: "CRM engine",
        status: "Live",
        sla: "Real time",
      },
      {
        step: "Route by project, budget, and language",
        owner: "Sales ops",
        status: "Testing",
        sla: "60s",
      },
      {
        step: "Trigger first follow-up sequence",
        owner: "Automation",
        status: "Live",
        sla: "2m",
      },
    ],
    integrations: [
      {
        name: "Project landing forms",
        type: "Next.js embed",
        health: "Connected",
        volume: "920 leads/month",
      },
      {
        name: "Contact us widget",
        type: "Hosted script",
        health: "Connected",
        volume: "310 leads/month",
      },
      {
        name: "Unit inquiry modal",
        type: "Inventory CTA",
        health: "Review",
        volume: "188 leads/month",
      },
    ],
  },
  "social-leads": {
    key: "social-leads",
    title: "Facebook and Instagram lead import",
    description:
      "Sync Meta lead forms, normalize payloads, and create source-attributed leads.",
    active: "Social leads",
    commandLabel: "Connect Meta",
    metrics: [
      {
        label: "Connected forms",
        value: "14",
        detail: "Facebook and Instagram campaigns",
      },
      {
        label: "Imported today",
        value: "86",
        detail: "Qualified social leads",
      },
      {
        label: "Sync delay",
        value: "3m",
        detail: "Average Meta webhook latency",
      },
      {
        label: "Attribution match",
        value: "97%",
        detail: "Campaign and ad set mapping",
      },
    ],
    workflow: [
      {
        step: "Receive Meta webhook payload",
        owner: "Integration service",
        status: "Live",
        sla: "5m",
      },
      {
        step: "Normalize campaign and form fields",
        owner: "Data mapping",
        status: "Live",
        sla: "1m",
      },
      {
        step: "Create or update CRM lead",
        owner: "Lead engine",
        status: "Live",
        sla: "1m",
      },
      {
        step: "Assign by source performance",
        owner: "Sales ops",
        status: "Testing",
        sla: "2m",
      },
    ],
    integrations: [
      {
        name: "Facebook Lead Ads",
        type: "Webhook",
        health: "Connected",
        volume: "1,840 leads/month",
      },
      {
        name: "Instagram Lead Ads",
        type: "Webhook",
        health: "Connected",
        volume: "980 leads/month",
      },
      {
        name: "Meta token rotation",
        type: "OAuth",
        health: "Pending",
        volume: "2 accounts",
      },
    ],
  },
  "follow-up-automation": {
    key: "follow-up-automation",
    title: "WhatsApp and SMS follow-up automation",
    description:
      "Automate reminders, confirmations, and overdue nudges across WhatsApp and SMS.",
    active: "Follow-up automation",
    commandLabel: "New sequence",
    metrics: [
      {
        label: "Active sequences",
        value: "11",
        detail: "Lead, visit, reservation, and payment journeys",
      },
      {
        label: "Delivery rate",
        value: "96.8%",
        detail: "WhatsApp and SMS combined",
      },
      { label: "Reply rate", value: "31.2%", detail: "Last 30 days" },
      {
        label: "Overdue recovered",
        value: "$184K",
        detail: "Payments nudged by automation",
      },
    ],
    workflow: [
      {
        step: "Pick channel by consent and preference",
        owner: "Automation",
        status: "Live",
        sla: "Real time",
      },
      {
        step: "Personalize project and unit context",
        owner: "CRM data",
        status: "Live",
        sla: "1m",
      },
      {
        step: "Send WhatsApp template or SMS",
        owner: "Messaging provider",
        status: "Live",
        sla: "5m",
      },
      {
        step: "Escalate non-response to agent task",
        owner: "Task engine",
        status: "Testing",
        sla: "24h",
      },
    ],
    integrations: [
      {
        name: "WhatsApp Business Cloud",
        type: "Messaging API",
        health: "Connected",
        volume: "7,420 messages/month",
      },
      {
        name: "SMS gateway",
        type: "Provider API",
        health: "Connected",
        volume: "3,180 messages/month",
      },
      {
        name: "Opt-out registry",
        type: "Compliance list",
        health: "Review",
        volume: "214 contacts",
      },
    ],
  },
  "email-campaigns": {
    key: "email-campaigns",
    title: "Email campaign automation",
    description:
      "Build segmented campaigns for launches, nurture journeys, and payment updates.",
    active: "Email campaigns",
    commandLabel: "Create campaign",
    metrics: [
      {
        label: "Active campaigns",
        value: "9",
        detail: "Launch, nurture, and finance journeys",
      },
      { label: "Open rate", value: "42.5%", detail: "Weighted last 30 days" },
      { label: "Click rate", value: "13.7%", detail: "Project and unit CTAs" },
      {
        label: "Unsubscribed",
        value: "0.8%",
        detail: "Below compliance threshold",
      },
    ],
    workflow: [
      {
        step: "Build segment from CRM filters",
        owner: "Marketing",
        status: "Live",
        sla: "On demand",
      },
      {
        step: "Render branded template",
        owner: "Brand system",
        status: "Live",
        sla: "1m",
      },
      {
        step: "Throttle and deliver campaign",
        owner: "Email provider",
        status: "Testing",
        sla: "2h",
      },
      {
        step: "Sync events to activity timeline",
        owner: "CRM engine",
        status: "Live",
        sla: "15m",
      },
    ],
    integrations: [
      {
        name: "Launch campaign sender",
        type: "SMTP/API",
        health: "Connected",
        volume: "18,200 emails/month",
      },
      {
        name: "Nurture sequence builder",
        type: "Automation",
        health: "Connected",
        volume: "3,900 contacts",
      },
      {
        name: "Suppression list",
        type: "Compliance",
        health: "Connected",
        volume: "1,204 records",
      },
    ],
  },
  "customer-portal": {
    key: "customer-portal",
    title: "Customer portal",
    description:
      "Give buyers self-service access to reservations, contracts, payments, and documents.",
    active: "Customer portal",
    commandLabel: "Invite customer",
    metrics: [
      {
        label: "Portal users",
        value: "1,284",
        detail: "Customers with active access",
      },
      {
        label: "Payment views",
        value: "4,910",
        detail: "Schedule and receipt page views",
      },
      {
        label: "Documents opened",
        value: "2,308",
        detail: "Contracts, IDs, and receipts",
      },
      {
        label: "Support deflection",
        value: "38%",
        detail: "Queries answered by portal",
      },
    ],
    workflow: [
      {
        step: "Invite after reservation approval",
        owner: "Sales admin",
        status: "Live",
        sla: "10m",
      },
      {
        step: "Verify email and phone",
        owner: "Identity service",
        status: "Testing",
        sla: "5m",
      },
      {
        step: "Expose tenant-scoped customer records",
        owner: "Portal API",
        status: "Live",
        sla: "Real time",
      },
      {
        step: "Accept uploads and service requests",
        owner: "Customer care",
        status: "Draft",
        sla: "1d",
      },
    ],
    integrations: [
      {
        name: "Customer portal app",
        type: "Next.js route group",
        health: "Review",
        volume: "1,284 users",
      },
      {
        name: "Receipt downloads",
        type: "Document service",
        health: "Connected",
        volume: "812/month",
      },
      {
        name: "Payment schedule viewer",
        type: "Portal widget",
        health: "Connected",
        volume: "4,910 views/month",
      },
    ],
  },
  "mobile-pwa": {
    key: "mobile-pwa",
    title: "Agent mobile app and PWA",
    description:
      "Mobile-first agent workspace for lead action, site visits, tasks, and offline notes.",
    active: "Mobile PWA",
    commandLabel: "Configure PWA",
    metrics: [
      { label: "Mobile agents", value: "64", detail: "Active field users" },
      { label: "Offline notes", value: "288", detail: "Synced after visits" },
      {
        label: "Push opt-in",
        value: "82%",
        detail: "Agent notification consent",
      },
      {
        label: "Visit check-ins",
        value: "416",
        detail: "Geo-tagged this month",
      },
    ],
    workflow: [
      {
        step: "Install app from browser prompt",
        owner: "Agent",
        status: "Testing",
        sla: "Self-service",
      },
      {
        step: "Cache lead and visit queue",
        owner: "PWA shell",
        status: "Draft",
        sla: "On login",
      },
      {
        step: "Capture visit notes offline",
        owner: "Field sales",
        status: "Testing",
        sla: "Real time",
      },
      {
        step: "Sync tasks and activity timeline",
        owner: "CRM API",
        status: "Testing",
        sla: "5m",
      },
    ],
    integrations: [
      {
        name: "PWA manifest",
        type: "Web app",
        health: "Pending",
        volume: "1 app shell",
      },
      {
        name: "Push notifications",
        type: "Web push",
        health: "Review",
        volume: "64 agents",
      },
      {
        name: "Offline sync queue",
        type: "IndexedDB",
        health: "Paused",
        volume: "288 notes",
      },
    ],
  },
  "sales-forecasting": {
    key: "sales-forecasting",
    title: "Advanced sales forecasting",
    description:
      "Forecast bookings, revenue, inventory absorption, and agent targets.",
    active: "Forecasting",
    commandLabel: "Run forecast",
    metrics: [
      {
        label: "Forecast revenue",
        value: "$8.4M",
        detail: "Weighted next 90 days",
      },
      {
        label: "Confidence",
        value: "78%",
        detail: "Pipeline and inventory model",
      },
      { label: "At-risk deals", value: "23", detail: "Needs manager action" },
      { label: "Absorption", value: "7.2/mo", detail: "Units sold per month" },
    ],
    workflow: [
      {
        step: "Score deals by stage and activity",
        owner: "Forecast engine",
        status: "Live",
        sla: "Daily",
      },
      {
        step: "Blend payment schedules",
        owner: "Finance",
        status: "Testing",
        sla: "Daily",
      },
      {
        step: "Model unit absorption by project",
        owner: "Inventory",
        status: "Live",
        sla: "Daily",
      },
      {
        step: "Publish manager variance report",
        owner: "Reporting",
        status: "Draft",
        sla: "Weekly",
      },
    ],
    integrations: [
      {
        name: "Pipeline scoring",
        type: "Forecast model",
        health: "Connected",
        volume: "246 active deals",
      },
      {
        name: "Revenue schedule",
        type: "Finance projection",
        health: "Connected",
        volume: "$12.1M pipeline",
      },
      {
        name: "Inventory absorption",
        type: "Project model",
        health: "Review",
        volume: "412 units",
      },
    ],
  },
  "contract-builder": {
    key: "contract-builder",
    title: "Contract template builder",
    description:
      "Design clause-based templates with variables, legal review, and PDF output readiness.",
    active: "Builder",
    commandLabel: "Add clause",
    metrics: [
      {
        label: "Clause blocks",
        value: "48",
        detail: "Reusable legal components",
      },
      {
        label: "Variables",
        value: "32",
        detail: "Customer, unit, price, and schedule fields",
      },
      {
        label: "Draft templates",
        value: "7",
        detail: "Pending legal approval",
      },
      {
        label: "PDF tests",
        value: "91%",
        detail: "Generated without layout warnings",
      },
    ],
    workflow: [
      {
        step: "Compose template from approved clauses",
        owner: "Legal ops",
        status: "Testing",
        sla: "On demand",
      },
      {
        step: "Insert CRM and unit variables",
        owner: "Template engine",
        status: "Live",
        sla: "Real time",
      },
      {
        step: "Preview PDF and signature fields",
        owner: "Document service",
        status: "Testing",
        sla: "1m",
      },
      {
        step: "Route legal approval",
        owner: "Approval workflow",
        status: "Live",
        sla: "2d",
      },
    ],
    integrations: [
      {
        name: "Clause library",
        type: "Template builder",
        health: "Connected",
        volume: "48 clauses",
      },
      {
        name: "Variable resolver",
        type: "Merge engine",
        health: "Connected",
        volume: "32 fields",
      },
      {
        name: "PDF preview",
        type: "Generation service",
        health: "Review",
        volume: "138 renders",
      },
    ],
  },
  "approval-workflows": {
    key: "approval-workflows",
    title: "Approval workflows",
    description:
      "Orchestrate finance, legal, sales manager, discount, and document approvals.",
    active: "Approvals",
    commandLabel: "New workflow",
    metrics: [
      {
        label: "Open approvals",
        value: "31",
        detail: "Across finance, legal, and sales",
      },
      { label: "SLA met", value: "88%", detail: "Last 30 days" },
      {
        label: "Escalations",
        value: "6",
        detail: "Waiting for manager action",
      },
      { label: "Auto-approved", value: "42%", detail: "Rules-based approvals" },
    ],
    workflow: [
      {
        step: "Evaluate approval rule set",
        owner: "Workflow engine",
        status: "Live",
        sla: "Real time",
      },
      {
        step: "Assign approver by tenant role",
        owner: "RBAC",
        status: "Live",
        sla: "1m",
      },
      {
        step: "Capture comments and decision trail",
        owner: "Approver",
        status: "Live",
        sla: "Per SLA",
      },
      {
        step: "Escalate overdue approval",
        owner: "Automation",
        status: "Testing",
        sla: "4h",
      },
    ],
    integrations: [
      {
        name: "Finance approval",
        type: "Payment workflow",
        health: "Connected",
        volume: "18 open",
      },
      {
        name: "Legal approval",
        type: "Contract workflow",
        health: "Connected",
        volume: "9 open",
      },
      {
        name: "Discount approval",
        type: "Sales workflow",
        health: "Review",
        volume: "4 open",
      },
    ],
  },
  "api-marketplace": {
    key: "api-marketplace",
    title: "API and webhook marketplace",
    description:
      "Manage public APIs, webhooks, partner connectors, and integration health.",
    active: "Marketplace",
    commandLabel: "Create webhook",
    metrics: [
      {
        label: "Published APIs",
        value: "22",
        detail: "CRM, inventory, payments, and documents",
      },
      {
        label: "Webhook events",
        value: "18",
        detail: "Tenant-scoped outbound events",
      },
      {
        label: "Partner apps",
        value: "12",
        detail: "Connected marketplace apps",
      },
      {
        label: "Success rate",
        value: "99.2%",
        detail: "Webhook delivery last 7 days",
      },
    ],
    workflow: [
      {
        step: "Register partner app and scopes",
        owner: "Platform admin",
        status: "Testing",
        sla: "On demand",
      },
      {
        step: "Subscribe to tenant events",
        owner: "Integration owner",
        status: "Live",
        sla: "Real time",
      },
      {
        step: "Sign webhook payloads",
        owner: "API gateway",
        status: "Live",
        sla: "Real time",
      },
      {
        step: "Retry and dead-letter failures",
        owner: "Webhook worker",
        status: "Testing",
        sla: "15m",
      },
    ],
    integrations: [
      {
        name: "Lead created webhook",
        type: "Outbound event",
        health: "Connected",
        volume: "12,400/month",
      },
      {
        name: "Payment approved webhook",
        type: "Outbound event",
        health: "Connected",
        volume: "2,880/month",
      },
      {
        name: "Partner app directory",
        type: "Marketplace",
        health: "Pending",
        volume: "12 apps",
      },
    ],
  },
};

export const enterpriseOverviewMetrics = [
  {
    label: "Enterprise modules",
    value: "10",
    detail: "Integrations, automation, portal, and platform APIs",
  },
  {
    label: "Automated touches",
    value: "28K",
    detail: "Messages, emails, and webhook deliveries/month",
  },
  {
    label: "Connected channels",
    value: "19",
    detail: "Website, Meta, WhatsApp, SMS, email, and APIs",
  },
  { label: "Ops SLA", value: "91%", detail: "Average workflow SLA compliance" },
];
