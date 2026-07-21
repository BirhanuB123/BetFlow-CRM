import { AuditLogsService } from './audit-logs.service';
import { Prisma } from '@prisma/client';
export declare class AuditLogsController {
    private readonly auditLogs;
    constructor(auditLogs: AuditLogsService);
    list(): Promise<({
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        userId: string | null;
        entityType: string;
        entityId: string;
        action: string;
        oldValues: Prisma.JsonValue | null;
        newValues: Prisma.JsonValue | null;
    })[]>;
    create(body: Prisma.AuditLogUncheckedCreateInput): Promise<{
        id: string;
        createdAt: Date;
        userId: string | null;
        entityType: string;
        entityId: string;
        action: string;
        oldValues: Prisma.JsonValue | null;
        newValues: Prisma.JsonValue | null;
    }>;
}
