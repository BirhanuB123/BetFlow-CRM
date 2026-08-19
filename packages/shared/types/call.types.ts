export type CallType = 'OUTBOUND' | 'INBOUND' | 'TELEGRAM' | 'WHATSAPP';

export type CallPurpose =
  | 'POST_VISIT_FOLLOWUP'
  | 'PAYMENT_REMINDER'
  | 'DIASPORA_OUTREACH'
  | 'PROPOSAL_REVIEW'
  | 'GENERAL_INQUIRY';

export type CallResult =
  | 'INTERESTED'
  | 'REQUESTED_PROFORMA'
  | 'BUSY_CALL_BACK'
  | 'NOT_INTERESTED'
  | 'NO_ANSWER'
  | 'SCHEDULED_SITE_VISIT';

export type CallStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'SKIPPED';

export interface CallLogItem {
  id: string;
  subject: string;
  callType: CallType;
  callPurpose: CallPurpose;
  callResult?: CallResult | null;
  dueDate: string;
  completedAt?: string | null;
  durationSeconds?: number | null;
  notes?: string | null;
  status: CallStatus;
  leadId?: string | null;
  customerId?: string | null;
  leadName?: string | null;
  customerName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCallLogInput {
  subject: string;
  callType?: CallType;
  callPurpose?: CallPurpose;
  callResult?: CallResult;
  dueDate?: string;
  durationSeconds?: number;
  notes?: string;
  status?: CallStatus;
  leadId?: string;
  customerId?: string;
}

export interface UpdateCallLogInput {
  subject?: string;
  callType?: CallType;
  callPurpose?: CallPurpose;
  callResult?: CallResult;
  dueDate?: string;
  durationSeconds?: number;
  notes?: string;
  status?: CallStatus;
  leadId?: string;
  customerId?: string;
}
