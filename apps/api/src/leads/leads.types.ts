export const LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'FOLLOW_UP',
  'WON',
  'LOST',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type CreateLeadInput = {
  firstName: string;
  lastName: string;
  company?: string;
  email?: string;
  phone?: string;
  status?: string;
  sourceId?: string;
  ownerId?: string;
};

export type UpdateLeadInput = {
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
  phone?: string;
  status?: string;
  sourceId?: string | null;
  ownerId?: string | null;
};

export type UpdateLeadStatusInput = {
  status: string;
};
