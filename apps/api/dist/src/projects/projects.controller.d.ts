import { InMemoryService } from '../database/in-memory.service';
import type { Project } from '../database/in-memory.service';
type CreateProjectBody = Omit<Project, 'id'>;
export declare class ProjectsController {
    private readonly store;
    constructor(store: InMemoryService);
    list(tenantId?: string): Project[];
    create(body: CreateProjectBody): Project;
}
export {};
