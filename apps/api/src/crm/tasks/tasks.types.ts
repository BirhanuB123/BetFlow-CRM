export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_CATEGORIES = [
  'PROPOSAL_PREPARATION',
  'SITE_VISIT_PREP',
  'BANK_MORTGAGE_DOCS',
  'CONTRACT_DRAFTING',
  'PAYMENT_COLLECTION',
  'CLIENT_FOLLOWUP',
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export type CreateTaskInput = {
  title: string;
  description?: string;
  dueDate?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  assigneeId?: string;
  entityType?: string;
  entityId?: string;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  assigneeId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
};

export type UpdateTaskStatusInput = {
  status: TaskStatus;
};
