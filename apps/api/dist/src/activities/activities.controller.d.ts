import { Activity, InMemoryService } from '../database/in-memory.service';
type CreateActivityBody = Omit<Activity, 'id' | 'createdAt'>;
export declare class ActivitiesController {
    private readonly store;
    constructor(store: InMemoryService);
    list(tenantId?: string): Activity[];
    create(body: CreateActivityBody): Activity;
}
export {};
