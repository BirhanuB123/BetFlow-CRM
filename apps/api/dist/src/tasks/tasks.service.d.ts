import { PrismaService } from '../database/prisma.service';
import { CreateTaskInput, UpdateTaskInput } from './tasks.types';
export declare class TasksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string, filters?: {
        status?: string;
        assigneeId?: string;
        open?: boolean;
    }): import("@prisma/client").Prisma.PrismaPromise<({
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
    get(tenantId: string, id: string): Promise<{
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
    create(tenantId: string, userId: string, input: CreateTaskInput): Promise<{
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
    update(tenantId: string, userId: string, id: string, input: UpdateTaskInput): Promise<{
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
    updateStatus(tenantId: string, userId: string, id: string, status: string): Promise<{
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
    remove(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private normalizeStatus;
    private normalizeDate;
    private assertUserBelongsToTenant;
    private recordAudit;
}
