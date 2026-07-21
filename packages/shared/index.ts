/**
 * @betflow/shared
 *
 * Central shared package for the BetFlow CRM monorepo.
 * Import from this package in both apps/api and apps/web:
 *
 *   import type { Lead, CreateLeadInput } from '@betflow/shared';
 *   import { LEAD_STATUSES, SYSTEM_ROLES } from '@betflow/shared';
 */

// All types
export * from './types/index.js';

// All constants
export * from './constants/index.js';
