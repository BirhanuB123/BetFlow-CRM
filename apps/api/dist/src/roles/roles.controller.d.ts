import { InMemoryService, Role } from '../database/in-memory.service';
type CreateRoleBody = Omit<Role, 'id'>;
export declare class RolesController {
    private readonly store;
    constructor(store: InMemoryService);
    list(tenantId?: string): Role[];
    create(body: CreateRoleBody): Role;
}
export {};
