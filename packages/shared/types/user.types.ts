/**
 * Shared user & auth types used by both apps/api and apps/web.
 * apps/api/src/auth/auth.types.ts re-exports from here.
 */

export type UserStatus = "Active" | "Invited" | "Suspended";

export type UserPermissionItem = {
  id?: string;
  name: string;
  module: string;
  description?: string | null;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  roles: string[];
  permissions?: UserPermissionItem[];
};

export type JwtPayload = {
  sub: string;
  email: string;
  roles?: string[];
  type?: "access" | "refresh";
  iat: number;
  exp: number;
};

export type AuthenticatedRequest = {
  headers: {
    authorization?: string;
  };
  user?: AuthenticatedUser;
};

/** Minimal user shape safe to expose on the frontend */
export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  lastSeen?: string;
};

// ─── Customer & Diaspora Buyer Portal Types ────────────────────────────────────

export type PortalAuthInput = {
  identifier: string;
};

export type PortalAuthResponse = {
  accessToken: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
  };
};

export type BankSlipUploadInput = {
  scheduleId: string;
  bankName: string;
  referenceNumber: string;
  amount: number;
  slipUrl?: string;
  notes?: string;
};

export type BankSlipSubmissionResult = {
  id: string;
  scheduleId: string;
  status: "PENDING_VERIFICATION" | "APPROVED" | "REJECTED";
  bankName: string;
  referenceNumber: string;
  submittedAt: string;
};

// ─── Account & Enterprise Organization Types ─────────────────────────────────

export type AccountOwner = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
};

export type AccountDetail = {
  id: string;
  name: string;
  accountType?: string | null;
  industry?: string | null;
  rating?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  billingStreet?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingCountry?: string | null;
  billingZip?: string | null;
  shippingStreet?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingCountry?: string | null;
  shippingZip?: string | null;
  annualRevenue?: string | null;
  employees?: number | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  tinNumber?: string | null;
  owner?: AccountOwner | null;
  parentAccount?: { id: string; name: string } | null;
  childAccounts: Array<{ id: string; name: string; accountType: string | null; rating: string | null }>;
  createdAt?: string;
  updatedAt?: string;
  customers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    title: string | null;
    _count: { deals: number };
  }>;
  contacts?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    title: string | null;
  }>;
  deals: Array<{
    id: string;
    name: string;
    value: string;
    stage: { id: string; name: string; probability: number };
    customer: { id: string; firstName: string; lastName: string } | null;
    unit: { id: string; unitNumber: string } | null;
  }>;
  _count: { customers: number; deals: number };
};

