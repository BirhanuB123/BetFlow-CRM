import { InMemoryService } from '../database/in-memory.service';
import type { SiteVisit } from '../database/in-memory.service';
type CreateSiteVisitBody = Omit<SiteVisit, 'id'>;
export declare class SiteVisitsController {
    private readonly store;
    constructor(store: InMemoryService);
    list(tenantId?: string): SiteVisit[];
    create(body: CreateSiteVisitBody): SiteVisit;
    updateStatus(id: string, status: SiteVisit['status'], outcome?: string): SiteVisit;
}
export {};
