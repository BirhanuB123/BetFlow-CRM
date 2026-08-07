/**
 * Shared task & activity constants.
 */

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
export const TASK_STATUS_LABELS = ["Open", "In progress", "Done"] as const;
export const TASK_PRIORITIES = ["High", "Medium", "Low"] as const;

export const ACTIVITY_TYPES = [
  "Call",
  "Email",
  "Assignment",
  "Task",
  "Note",
  "Deal",
] as const;
