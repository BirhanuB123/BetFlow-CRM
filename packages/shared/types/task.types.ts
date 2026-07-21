/**
 * Shared task types used by both apps/api and apps/web.
 * Extracted from:
 *   - apps/api/src/tasks/tasks.types.ts
 *   - apps/web/src/features/leads/crm-data.ts
 */
import type { Priority } from './common.types';

// ─── Status ────────────────────────────────────────────────────────────────────

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** UI-friendly task status labels */
export type TaskStatusLabel = 'Open' | 'In progress' | 'Done';

// ─── Input Types (API) ─────────────────────────────────────────────────────────

export type CreateTaskInput = {
  title: string;
  description?: string;
  dueDate?: string | null;
  status?: string;
  assigneeId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  dueDate?: string | null;
  status?: string;
  assigneeId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
};

export type UpdateTaskStatusInput = {
  status: string;
};

// ─── Display Types (UI) ───────────────────────────────────────────────────────

/** Task shape used on the frontend to display in tables */
export type Task = {
  id: string;
  title: string;
  owner: string;
  relatedTo: string;
  due: string;
  status: TaskStatusLabel;
  priority: Priority;
};
