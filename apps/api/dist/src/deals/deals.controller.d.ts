import { InMemoryService } from '../database/in-memory.service';
import type { Deal } from '../database/in-memory.service';
type CreateDealBody = Omit<Deal, 'id'>;
export declare class DealsController {
    private readonly store;
    constructor(store: InMemoryService);
    list(tenantId?: string): Deal[];
    create(body: CreateDealBody): Deal;
    move(id: string, stage: string): Deal;
}
export {};
