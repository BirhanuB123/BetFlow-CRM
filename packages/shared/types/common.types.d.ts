export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};
export type Timestamps = {
  createdAt: string;
  updatedAt: string;
};
export type SortOrder = "asc" | "desc";
export type Priority = "High" | "Medium" | "Low";
