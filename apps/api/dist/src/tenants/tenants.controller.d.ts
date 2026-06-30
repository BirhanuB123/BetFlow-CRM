import { InMemoryService, Tenant } from '../database/in-memory.service';
type RegisterTenantBody = {
    companyName: string;
    slug: string;
    ownerName: string;
    ownerEmail: string;
    region?: string;
    plan?: string;
};
type UpdateTenantBody = Partial<Pick<Tenant, 'name' | 'region' | 'plan' | 'status'>>;
export declare class TenantsController {
    private readonly store;
    constructor(store: InMemoryService);
    list(): Tenant[];
    get(id: string): Tenant;
    create(body: RegisterTenantBody): {
        tenant: Tenant;
        owner: import("../database/in-memory.service").User;
        roles: import("../database/in-memory.service").Role[];
    };
    update(id: string, body: UpdateTenantBody): Tenant;
}
export {};
