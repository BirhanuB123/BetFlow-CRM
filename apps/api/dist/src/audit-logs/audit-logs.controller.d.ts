import { AuditLog, InMemoryService } from '../database/in-memory.service';
type CreateAuditLogBody = Omit<AuditLog, 'id' | 'createdAt'>;
export declare class AuditLogsController {
    private readonly store;
    constructor(store: InMemoryService);
    list(): AuditLog[];
    create(body: CreateAuditLogBody): AuditLog;
}
export {};
