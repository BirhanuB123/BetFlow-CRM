/**
 * Shared deal types used by both apps/api and apps/web.
 * Extracted from:
 *   - apps/api/src/deals/deals.types.ts
 *   - apps/web/src/features/leads/crm-data.ts
 */
import type { LeadStage } from "./lead.types.js";

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

export type DealStage = {
  id: string;
  name: string;
  order: number;
  probability: number;
};

export type DealCustomer = {
  id: string;
  firstName: string;
  lastName: string;
};

export type DealUnit = {
  id: string;
  unitNumber: string;
  type: string;
};

export type ApiDeal = {
  id: string;
  name: string;
  value: string;
  title?: string;
  amount?: number;
  status?: string;
  expectedCloseDate?: string | null;
  stage: DealStage;
  customer: DealCustomer;
  unit?: DealUnit | null;
  createdAt?: string;
  updatedAt?: string;
};

export type NewDeal = {
  name: string;
  value: string;
  customerId: string;
  stageId: string;
  unitId?: string;
  expectedCloseDate?: string;
  title?: string;
  amount?: string;
};


// ─── Revenue Forecasting Types ────────────────────────────────────────────────

export type ForecastingStageBucket = {
  stageId: string;
  stageName: string;
  probability: number;
  dealCount: number;
  rawVolume: number;
  weightedVolume: number;
};

export type RevenueForecastReport = {
  totalRawPipeline: number;
  totalWeightedPipeline: number;
  stages: ForecastingStageBucket[];
};
