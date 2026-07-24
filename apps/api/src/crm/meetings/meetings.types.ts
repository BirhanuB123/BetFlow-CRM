export const MEETING_STATUSES = [
  'SCHEDULED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
] as const;

export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export const MEETING_TYPES = [
  'IN_PERSON_OFFICE',
  'VIRTUAL_ZOOM',
  'PHONE_CALL',
] as const;

export type MeetingType = (typeof MEETING_TYPES)[number];

export type CreateMeetingInput = {
  title: string;
  meetingType?: string;
  date: string;
  durationMinutes?: number;
  location?: string;
  agenda?: string;
  notes?: string;
  leadId?: string | null;
  customerId?: string | null;
};

export type UpdateMeetingInput = {
  title?: string;
  meetingType?: string;
  date?: string;
  durationMinutes?: number;
  location?: string | null;
  agenda?: string | null;
  notes?: string | null;
  leadId?: string | null;
  customerId?: string | null;
};

export type UpdateMeetingStatusInput = {
  status: string;
};
