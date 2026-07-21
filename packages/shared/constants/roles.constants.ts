/**
 * Shared role & permission constants used by both apps/api and apps/web.
 * Extracted from apps/web/src/features/auth/phase-one-data.ts
 */

export const SYSTEM_ROLES = {
  OWNER: 'Owner',
  SALES_MANAGER: 'Sales Manager',
  FINANCE: 'Finance',
  AGENT: 'Agent',
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

/** Permission strings used across RBAC system */
export const PERMISSIONS = {
  // Tenant
  TENANT_MANAGE: 'tenant.manage',

  // Users
  USERS_MANAGE: 'users.manage',

  // Leads
  LEADS_READ: 'leads.read',
  LEADS_MANAGE: 'leads.manage',

  // Deals
  DEALS_UPDATE: 'deals.update',
  DEALS_MANAGE: 'deals.manage',

  // Tasks
  TASKS_MANAGE: 'tasks.manage',

  // Payments
  PAYMENTS_MANAGE: 'payments.manage',

  // Contracts
  CONTRACTS_READ: 'contracts.read',

  // Reports
  REPORTS_READ: 'reports.read',

  // Audit
  AUDIT_READ: 'audit.read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
