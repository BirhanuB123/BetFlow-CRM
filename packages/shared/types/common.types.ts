/**
 * Shared generic utility types used by both apps/api and apps/web.
 */

/** Standard paginated API response envelope */
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

/** Standard single-item API response envelope */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

/** Common entity timestamps */
export type Timestamps = {
  createdAt: string;
  updatedAt: string;
};

/** Sortable field direction */
export type SortOrder = "asc" | "desc";

/** Priority levels used across leads, tasks, etc. */
export type Priority = "High" | "Medium" | "Low";
