export const ACCOUNT_TYPES = [
  'CUSTOMER',
  'INVESTOR',
  'PARTNER',
  'DEVELOPER',
  'SUPPLIER',
  'OTHER',
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_RATINGS = ['HOT', 'WARM', 'COLD'] as const;

export type AccountRating = (typeof ACCOUNT_RATINGS)[number];

export type CreateAccountInput = {
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
  annualRevenue?: number | string | null;
  employees?: number | null;
  description?: string | null;
  parentAccountId?: string | null;
  ownerId?: string | null;
};

export type UpdateAccountInput = Partial<CreateAccountInput>;
