export const LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'FOLLOW_UP',
  'WON',
  'LOST',
  'CONVERTED',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type ConvertLeadInput = {
  // Link the new contact to an account.
  createAccount?: boolean; // create an account from the lead's company/name
  accountId?: string | null; // or attach to an existing account
  // Optionally open a deal for the new contact.
  deal?: {
    name: string;
    value: number | string;
    stageId: string;
  } | null;
};

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
