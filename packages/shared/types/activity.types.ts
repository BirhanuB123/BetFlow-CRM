/**
 * Shared activity & note types used by both apps/api and apps/web.
 * Extracted from apps/web/src/features/leads/crm-data.ts
 */

// ─── Activity ─────────────────────────────────────────────────────────────────

export type ActivityType = 'Call' | 'Email' | 'Assignment' | 'Task' | 'Note' | 'Deal';

export type Activity = {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  type: ActivityType;
};

// ─── Note ─────────────────────────────────────────────────────────────────────

export type Note = {
  id: string;
  relatedTo: string;
  author: string;
  body: string;
  createdAt: string;
};
