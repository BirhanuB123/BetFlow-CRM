/**
 * Re-exports task types from @betflow/shared.
 * The source of truth is now packages/shared/types/task.types.ts
 */
export type {
  TaskStatus,
  TaskStatusLabel,
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from '@betflow/shared';

export { TASK_STATUSES } from '@betflow/shared';
