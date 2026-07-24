export const CALL_STATUSES = [
  'PENDING',
  'COMPLETED',
  'OVERDUE',
  'SKIPPED',
] as const;

export type CallStatus = (typeof CALL_STATUSES)[number];

export const CALL_TYPES = [
  'OUTBOUND',
  'INBOUND',
  'TELEGRAM',
  'WHATSAPP',
] as const;

export type CallType = (typeof CALL_TYPES)[number];

export const CALL_PURPOSES = [
  'POST_VISIT_FOLLOWUP',
  'PAYMENT_REMINDER',
  'DIASPORA_OUTREACH',
  'PROPOSAL_REVIEW',
  'GENERAL_INQUIRY',
] as const;

export type CallPurpose = (typeof CALL_PURPOSES)[number];

export const CALL_RESULTS = [
  'INTERESTED',
  'REQUESTED_PROFORMA',
  'BUSY_CALL_BACK',
  'NOT_INTERESTED',
  'NO_ANSWER',
  'SCHEDULED_SITE_VISIT',
] as const;

export type CallResult = (typeof CALL_RESULTS)[number];

export type CreateCallInput = {
  subject: string;
  callType?: string;
  callPurpose?: string;
  callResult?: string;
  dueDate: string;
  durationSeconds?: number;
  notes?: string;
  leadId?: string | null;
  customerId?: string | null;
};

export type UpdateCallInput = {
  subject?: string;
  callType?: string;
  callPurpose?: string;
  callResult?: string | null;
  dueDate?: string;
  durationSeconds?: number | null;
  notes?: string | null;
  leadId?: string | null;
  customerId?: string | null;
};

export type CompleteCallInput = {
  callResult?: string;
  notes?: string;
  durationSeconds?: number;
};
