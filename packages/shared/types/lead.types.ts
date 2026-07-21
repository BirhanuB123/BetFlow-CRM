/**
 * Shared lead types used by both apps/api and apps/web.
 * Extracted from:
 *   - apps/api/src/leads/leads.types.ts
 *   - apps/web/src/features/leads/crm-data.ts
 */
import type { Priority } from './common.types';
import { LEAD_STATUSES } from '../constants/lead.constants';

export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** UI pipeline stage labels */
export type LeadStage = 'New' | 'Qualified' | 'Tour Scheduled' | 'Proposal' | 'Won' | 'Lost';

// ─── Input Types (API) ─────────────────────────────────────────────────────────

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

export type ConvertLeadInput = {
  createAccount?: boolean;
  accountId?: string | null;
  deal?: {
    name: string;
    value: number | string;
    stageId: string;
  } | null;
};

// ─── Display Types (UI) ───────────────────────────────────────────────────────

/** Lead shape used on the frontend to display in tables / kanban */
export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  budget: string;
  stage: LeadStage;
  assignedTo: string;
  priority: Priority;
  lastActivity: string;
};
