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
export * from "./types/index.js";

// All constants
export * from "./constants/index.js";

// All validations
export * from "./validations/index.js";

// All utilities
export { formatDate, daysRemaining, timeAgo } from "./utils/date.utils.js";
export { formatStatusLabel, formatCurrencyAmount } from "./utils/format.utils.js";
export { normalizePhone, classifyLeadOrigin, type LeadOriginInfo } from "./utils/phone.utils.js";
export { getTransliteratedVariants } from "./utils/transliteration.utils.js";
export { toEthiopianDate, type EthiopianDateInfo } from "./utils/ethiopian-calendar.utils.js";
