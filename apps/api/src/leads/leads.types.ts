/**
 * Re-exports lead types from @betflow/shared.
 * The source of truth is now packages/shared/types/lead.types.ts
 */
export type {
  LeadStatus,
  LeadStage,
  CreateLeadInput,
  UpdateLeadInput,
  UpdateLeadStatusInput,
  ConvertLeadInput,
} from '@betflow/shared';

export { LEAD_STATUSES } from '@betflow/shared';
