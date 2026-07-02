import type { AuthenticatedUser } from '../auth/auth.types';
import { TenantsService } from './tenants.service';
import type { RegisterTenantBody, UpdateTenantBody } from './tenants.service';
export declare class TenantsController {
    private readonly tenants;
    constructor(tenants: TenantsService);
    list(user: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        slug: string | null;
        domain: string | null;
        region: string;
        plan: string;
        status: string;
        ownerUserId: string | undefined;
        createdAt: Date;
        updatedAt: Date;
    }>;
    get(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        name: string;
        slug: string | null;
        domain: string | null;
        region: string;
        plan: string;
        status: string;
        ownerUserId: string | undefined;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(body: RegisterTenantBody): Promise<{
        tenant: {
            id: string;
            name: string;
            slug: string | null;
            domain: string | null;
            region: string;
            plan: string;
            status: string;
            ownerUserId: string | undefined;
            createdAt: Date;
            updatedAt: Date;
        };
        owner: {
            id: string;
            tenantId: string;
            name: string;
            email: string;
            roleId: string | undefined;
            roleName: string | undefined;
            status: string;
            createdAt: Date;
            updatedAt: Date;
        };
        roles: {
            id: string;
            tenantId: string;
            name: string;
            description: string | null;
        }[];
    }>;
    update(user: AuthenticatedUser, id: string, body: UpdateTenantBody): Promise<{
        id: string;
        name: string;
        slug: string | null;
        domain: string | null;
        region: string;
        plan: string;
        status: string;
        ownerUserId: string | undefined;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
