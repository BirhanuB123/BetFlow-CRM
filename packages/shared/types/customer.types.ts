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

export type CustomerType = "Buyer" | "Investor" | "Tenant";
export type CustomerStatus = "Active" | "Onboarding" | "Dormant";

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

export type ApiCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  nationalId?: string | null;
  tinNumber?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count: {
    deals: number;
    reservations: number;
    contracts: number;
  };
};

export type CustomerOption = {
  id: string;
  firstName: string;
  lastName: string;
};

export type NewCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId?: string;
  tinNumber?: string;
  address?: string;
  city?: string;
  country?: string;
};

export type CustomerDetail = ApiCustomer & {
  deals?: Array<{
    id: string;
    title: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  reservations?: Array<{
    id: string;
    reservationNumber: string;
    status: string;
    createdAt: string;
    unit?: { id: string; unitNumber: string } | null;
  }>;
  contracts?: Array<{
    id: string;
    contractNumber: string;
    status: string;
    totalPrice: number;
    createdAt: string;
  }>;
};

