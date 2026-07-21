/**
 * Shared lead constants used by both apps/api and apps/web.
 */

export const LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'FOLLOW_UP',
  'WON',
  'LOST',
  'CONVERTED',
] as const;

export const LEAD_STAGES = [
  'New',
  'Qualified',
  'Tour Scheduled',
  'Proposal',
  'Won',
  'Lost',
] as const;

export const LEAD_PRIORITIES = ['High', 'Medium', 'Low'] as const;

export const LEAD_SOURCES = [
  'Website',
  'Referral',
  'Campaign',
  'Open house',
  'Social',
  'Cold call',
  'Other',
] as const;

/** Stages that appear in the sales pipeline kanban (excludes terminal stages) */
export const PIPELINE_STAGES = [
  'New',
  'Qualified',
  'Tour Scheduled',
  'Proposal',
  'Won',
] as const;
