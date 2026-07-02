import { PrismaService } from '../database/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
export type CreateRoleBody = {
    tenantId: string;
    name: string;
    description?: string;
    permissionIds?: string[];
    permissionKeys?: string[];
};
type PermissionResult = {
    id: string;
    name: string;
    module: string;
    description: string | null;
};
export declare class RolesService {
    private readonly prisma;
    private readonly tenants;
    constructor(prisma: PrismaService, tenants: TenantsService);
    listRoles(tenantId?: string): Promise<{
        permissionKeys: string[];
        permissions: PermissionResult[];
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
    }[]>;
    createRole(input: CreateRoleBody): Promise<{
        permissionKeys: string[];
        permissions: PermissionResult[];
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
    }>;
    private resolvePermissions;
}
export {};
