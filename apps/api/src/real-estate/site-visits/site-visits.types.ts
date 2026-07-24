export const SITE_VISIT_STATUSES = [
  'SCHEDULED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
] as const;

export type SiteVisitStatus = (typeof SITE_VISIT_STATUSES)[number];

export type CreateSiteVisitInput = {
  date: string;
  status?: string;
  notes?: string;
  leadId?: string | null;
  customerId?: string | null;
  preferredSqm?: number | string | null;
  bedroomCount?: number | null;
  preferredFloor?: string | null;
  facingDirection?: string | null;
  propertyType?: string | null;
  purpose?: string | null;
  budgetETB?: number | string | null;
  paymentMethod?: string | null;
  demands?: string | null;
};

export type UpdateSiteVisitInput = {
  date?: string;
  notes?: string | null;
  leadId?: string | null;
  customerId?: string | null;
  preferredSqm?: number | string | null;
  bedroomCount?: number | null;
  preferredFloor?: string | null;
  facingDirection?: string | null;
  propertyType?: string | null;
  purpose?: string | null;
  budgetETB?: number | string | null;
  paymentMethod?: string | null;
  demands?: string | null;
};

export type UpdateSiteVisitStatusInput = {
  status: string;
};
