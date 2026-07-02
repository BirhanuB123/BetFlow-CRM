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
  email?: string;
  phone?: string;
  status?: string;
  sourceId?: string;
};

export type UpdateLeadStatusInput = {
  status: string;
};
