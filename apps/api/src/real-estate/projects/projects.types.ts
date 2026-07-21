export const PROJECT_STATUSES = [
  'PLANNING',
  'ACTIVE',
  'SELLING',
  'COMPLETED',
  'ON_HOLD',
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type CreateProjectInput = {
  name: string;
  description?: string | null;
  status?: string;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string | null;
  status?: string;
};
