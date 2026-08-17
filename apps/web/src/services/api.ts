/**
 * Centralized Service Abstraction for BetFlow CRM HTTP API interactions.
 */

export {
  API_BASE_URL,
  getSession,
  clearSession,
  updateSessionCurrency,
  apiFetch,
  apiUpload,
  apiDownload,
} from "@/lib/api";

export type { ApiFetchOptions } from "@/lib/api";
