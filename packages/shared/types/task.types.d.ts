import type { Priority } from './common.types';
import { TASK_STATUSES } from '../constants/task.constants';
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskStatusLabel = 'Open' | 'In progress' | 'Done';
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
export type Task = {
    id: string;
    title: string;
    owner: string;
    relatedTo: string;
    due: string;
    status: TaskStatusLabel;
    priority: Priority;
};
