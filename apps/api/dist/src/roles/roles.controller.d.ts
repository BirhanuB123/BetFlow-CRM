import type { AuthenticatedUser } from '../auth/auth.types';
import { RolesService } from './roles.service';
import type { CreateRoleBody } from './roles.service';
export declare class RolesController {
    private readonly roles;
    constructor(roles: RolesService);
    list(user: AuthenticatedUser): Promise<{
        permissionKeys: string[];
        permissions: {
            id: string;
            name: string;
            module: string;
            description: string | null;
        }[];
        id: string;
        name: string;
        description: string | null;
    }[]>;
    create(user: AuthenticatedUser, body: CreateRoleBody): Promise<{
        permissionKeys: string[];
        permissions: {
            id: string;
            name: string;
            module: string;
            description: string | null;
        }[];
        id: string;
        name: string;
        description: string | null;
    }>;
    update(user: AuthenticatedUser, id: string, body: {
        name: string;
        description?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
