/**
 * Shared lead types used by both apps/api and apps/web.
 * Extracted from:
 *   - apps/api/src/leads/leads.types.ts
 *   - apps/web/src/features/leads/crm-data.ts
 */
import type { Priority } from "./common.types.js";
import { LEAD_STATUSES } from "../constants/lead.constants.js";

export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** UI pipeline stage labels */
export type LeadStage =
  "New" | "Qualified" | "Tour Scheduled" | "Proposal" | "Won" | "Lost";

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
  interestedProjectId?: string;
  telegramHandle?: string;
  websiteInquiryUrl?: string;
  budgetMinETB?: number;
  budgetMaxETB?: number;
  timeline?:
    | "IMMEDIATE"
    | "3_MONTHS"
    | "6_MONTHS"
    | "12_MONTHS"
    | "24_PLUS_MONTHS"
    | string;
  preferredBedrooms?: number;
  preferredPaymentPlan?:
    "FULL_CASH" | "CUSTOM_INSTALLMENT" | "BANK_LOAN" | string;
};

export type PublicWebsiteLeadInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  interestedProjectId?: string;
  message?: string;
  websiteInquiryUrl?: string;
  preferredBedrooms?: number;
  budgetMinETB?: number;
  budgetMaxETB?: number;
  timeline?: string;
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
  interestedProjectId?: string | null;
  telegramHandle?: string | null;
  websiteInquiryUrl?: string | null;
  budgetMinETB?: number | null;
  budgetMaxETB?: number | null;
  timeline?: string | null;
  preferredBedrooms?: number | null;
  preferredPaymentPlan?: string | null;
};

export type UpdateLeadStatusInput = {
  status: string;
};

export type ConvertLeadInput = {
  createAccount?: boolean;
  accountId?: string | null;
  unitId?: string | null;
  deal?: {
    name: string;
    value: number | string;
    stageId: string;
  } | null;
};

export type AiLeadScore = {
  score: number;
  intent: "HOT" | "WARM" | "COLD";
  factors: string[];
  suggestedNextAction: string;
  recommendedPriority: Priority;
};

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
  aiScore?: AiLeadScore;
};
