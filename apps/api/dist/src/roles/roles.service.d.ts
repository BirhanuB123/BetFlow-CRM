import { PrismaService } from '../database/prisma.service';
export type CreateRoleBody = {
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
    constructor(prisma: PrismaService);
    listRoles(): Promise<{
        permissionKeys: string[];
        permissions: PermissionResult[];
        id: string;
        name: string;
        description: string | null;
    }[]>;
    createRole(input: CreateRoleBody): Promise<{
        permissionKeys: string[];
        permissions: PermissionResult[];
        id: string;
        name: string;
        description: string | null;
    }>;
    private resolvePermissions;
}
export {};
