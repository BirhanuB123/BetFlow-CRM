import {
  Activity,
  Building2,
  CheckCircle2,
  ClipboardList,
  KeyRound,
  LucideIcon,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

export type Metric = {
  label: string;
  value: string;
  detail: string;
};

export type Role = {
  name: string;
  scope: string;
  users: number;
  permissions: string[];
};

export type User = {
  name: string;
  email: string;
  role: string;
  status: "Active" | "Invited" | "Suspended";
  lastSeen: string;
};

export type AuditLog = {
  actor: string;
  action: string;
  target: string;
  time: string;
  severity: "Info" | "Warning" | "Critical";
};

export type SetupStep = {
  label: string;
  detail: string;
  icon: LucideIcon;
  status: "Ready" | "In progress";
};

export const tenant = {
  name: "BetFlow Realty",
  slug: "betflow-realty",
  region: "US East",
  plan: "Growth",
  status: "Active",
  owner: "Maya Johnson",
};

export const metrics: Metric[] = [
  { label: "Active users", value: "24", detail: "18 online this week" },
  { label: "Open audit events", value: "7", detail: "2 require admin review" },
  { label: "Roles configured", value: "5", detail: "Least-privilege model" },
  { label: "Tenant readiness", value: "82%", detail: "Settings and RBAC complete" },
];

export const roles: Role[] = [
  {
    name: "Owner",
    scope: "Tenant-wide",
    users: 2,
    permissions: ["tenant.manage", "users.manage", "audit.read"],
  },
  {
    name: "Sales Manager",
    scope: "Sales pipeline",
    users: 4,
    permissions: ["leads.manage", "deals.manage", "reports.read"],
  },
  {
    name: "Finance",
    scope: "Payments and contracts",
    users: 3,
    permissions: ["payments.manage", "contracts.read", "audit.read"],
  },
  {
    name: "Agent",
    scope: "Assigned records",
    users: 15,
    permissions: ["leads.read", "deals.update", "tasks.manage"],
  },
];

export const users: User[] = [
  {
    name: "Maya Johnson",
    email: "maya@betflow.example",
    role: "Owner",
    status: "Active",
    lastSeen: "Today, 10:42 AM",
  },
  {
    name: "Omar Haddad",
    email: "omar@betflow.example",
    role: "Sales Manager",
    status: "Active",
    lastSeen: "Today, 9:18 AM",
  },
  {
    name: "Lina Park",
    email: "lina@betflow.example",
    role: "Finance",
    status: "Invited",
    lastSeen: "Invite sent yesterday",
  },
  {
    name: "Noah Smith",
    email: "noah@betflow.example",
    role: "Agent",
    status: "Active",
    lastSeen: "Yesterday, 4:07 PM",
  },
];

export const auditLogs: AuditLog[] = [
  {
    actor: "Maya Johnson",
    action: "Updated tenant billing contact",
    target: "Tenant settings",
    time: "11 min ago",
    severity: "Info",
  },
  {
    actor: "Omar Haddad",
    action: "Changed Sales Manager permissions",
    target: "RBAC",
    time: "1 hr ago",
    severity: "Warning",
  },
  {
    actor: "System",
    action: "Blocked failed login burst",
    target: "Auth policy",
    time: "2 hrs ago",
    severity: "Critical",
  },
  {
    actor: "Maya Johnson",
    action: "Invited Lina Park",
    target: "User management",
    time: "Yesterday",
    severity: "Info",
  },
];

export const setupSteps: SetupStep[] = [
  {
    label: "Tenant registration",
    detail: "Company profile, workspace slug, owner account",
    icon: Building2,
    status: "Ready",
  },
  {
    label: "Authentication",
    detail: "Login, invite acceptance, session policy",
    icon: KeyRound,
    status: "Ready",
  },
  {
    label: "RBAC",
    detail: "Roles, permissions, role assignments",
    icon: ShieldCheck,
    status: "Ready",
  },
  {
    label: "User management",
    detail: "Invitations, status, last activity",
    icon: UsersRound,
    status: "Ready",
  },
  {
    label: "Tenant settings",
    detail: "Region, plan, compliance defaults",
    icon: CheckCircle2,
    status: "Ready",
  },
  {
    label: "Audit logs",
    detail: "Security and admin activity timeline",
    icon: ClipboardList,
    status: "Ready",
  },
  {
    label: "Dashboard shell",
    detail: "Navigation, header, workspace context",
    icon: Activity,
    status: "In progress",
  },
];
