/**
 * Shared customer types used by both apps/api and apps/web.
 * Extracted from:
 *   - apps/api/src/customers/customers.types.ts
 *   - apps/web/src/features/leads/crm-data.ts
 */

// ─── Input Types (API) ─────────────────────────────────────────────────────────

export type CreateCustomerInput = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string | null;
  accountId?: string | null;
};

export type UpdateCustomerInput = {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
  accountId?: string | null;
};

// ─── Display Types (UI) ───────────────────────────────────────────────────────

export type CustomerType = 'Buyer' | 'Investor' | 'Tenant';
export type CustomerStatus = 'Active' | 'Onboarding' | 'Dormant';

/** Customer shape used on the frontend to display in tables */
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: CustomerType;
  owner: string;
  lifetimeValue: string;
  status: CustomerStatus;
};
