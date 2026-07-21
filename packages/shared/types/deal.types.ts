/**
 * Shared deal types used by both apps/api and apps/web.
 * Extracted from:
 *   - apps/api/src/deals/deals.types.ts
 *   - apps/web/src/features/leads/crm-data.ts
 */
import type { LeadStage } from './lead.types';

// ─── Input Types (API) ─────────────────────────────────────────────────────────

export type CreateDealInput = {
  name: string;
  value: number | string;
  stageId: string;
  customerId: string;
  accountId?: string | null;
  unitId?: string | null;
};

export type UpdateDealInput = {
  name?: string;
  value?: number | string;
  stageId?: string;
  customerId?: string;
  accountId?: string | null;
  unitId?: string | null;
};

export type MoveDealStageInput = {
  stageId: string;
};

// ─── Display Types (UI) ───────────────────────────────────────────────────────

/** Deal shape used on the frontend to display in pipeline / tables */
export type Deal = {
  id: string;
  leadId: string;
  customer: string;
  property: string;
  value: string;
  stage: LeadStage;
  probability: number;
  closeDate: string;
  owner: string;
};
