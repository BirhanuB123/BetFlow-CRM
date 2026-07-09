import { TasksService } from './tasks.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput } from './tasks.types';
export declare class TasksController {
    private readonly tasks;
    constructor(tasks: TasksService);
    list(user: AuthenticatedUser, status?: string, assigneeId?: string, open?: string): import("@prisma/client").Prisma.PrismaPromise<({
        assignee: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        description: string | null;
        status: string;
        title: string;
        dueDate: Date | null;
        entityType: string | null;
        entityId: string | null;
        assigneeId: string | null;
    })[]>;
    get(user: AuthenticatedUser, id: string): Promise<{
        assignee: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        description: string | null;
        status: string;
        title: string;
        dueDate: Date | null;
        entityType: string | null;
        entityId: string | null;
        assigneeId: string | null;
    }>;
    create(user: AuthenticatedUser, body: CreateTaskInput): Promise<{
        assignee: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        description: string | null;
        status: string;
        title: string;
        dueDate: Date | null;
        entityType: string | null;
        entityId: string | null;
        assigneeId: string | null;
    }>;
    updateStatus(user: AuthenticatedUser, id: string, body: UpdateTaskStatusInput): Promise<{
        assignee: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        description: string | null;
        status: string;
        title: string;
        dueDate: Date | null;
        entityType: string | null;
        entityId: string | null;
        assigneeId: string | null;
    }>;
    update(user: AuthenticatedUser, id: string, body: UpdateTaskInput): Promise<{
        assignee: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        description: string | null;
        status: string;
        title: string;
        dueDate: Date | null;
        entityType: string | null;
        entityId: string | null;
        assigneeId: string | null;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
