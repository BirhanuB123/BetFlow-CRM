export declare const TASK_STATUSES: readonly ["TODO", "IN_PROGRESS", "DONE"];
export type TaskStatus = (typeof TASK_STATUSES)[number];
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
