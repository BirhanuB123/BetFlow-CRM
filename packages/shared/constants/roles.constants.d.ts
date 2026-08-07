export declare const SYSTEM_ROLES: {
  readonly OWNER: "Owner";
  readonly SALES_MANAGER: "Sales Manager";
  readonly FINANCE: "Finance";
  readonly AGENT: "Agent";
};
export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];
export declare const PERMISSIONS: {
  readonly TENANT_MANAGE: "tenant.manage";
  readonly USERS_MANAGE: "users.manage";
  readonly LEADS_READ: "leads.read";
  readonly LEADS_MANAGE: "leads.manage";
  readonly DEALS_UPDATE: "deals.update";
  readonly DEALS_MANAGE: "deals.manage";
  readonly TASKS_MANAGE: "tasks.manage";
  readonly PAYMENTS_MANAGE: "payments.manage";
  readonly CONTRACTS_READ: "contracts.read";
  readonly REPORTS_READ: "reports.read";
  readonly AUDIT_READ: "audit.read";
};
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
