import { InMemoryService, Lead } from '../database/in-memory.service';
type CreateLeadBody = Omit<Lead, 'id'>;
export declare class LeadsController {
    private readonly store;
    constructor(store: InMemoryService);
    list(tenantId?: string): Lead[];
    create(body: CreateLeadBody): Lead;
    assign(id: string, assignedToUserId: string): Lead;
}
export {};
