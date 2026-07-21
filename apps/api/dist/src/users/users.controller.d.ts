import type { AuthenticatedUser } from '../auth/auth.types';
import { UsersService } from './users.service';
import type { InviteUserBody } from './users.service';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    list(user: AuthenticatedUser): Promise<{
        id: string;
        name: string;
        email: string;
        status: string;
        createdAt: Date;
        roleId: string;
        roleName: string;
    }[]>;
    invite(user: AuthenticatedUser, body: InviteUserBody): Promise<{
        roles: ({
            role: {
                id: string;
                name: string;
            };
        } & {
            userId: string;
            roleId: string;
        })[];
    } & {
        id: string;
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRole(user: AuthenticatedUser, id: string, body: {
        roleId: string;
    }): Promise<{
        role: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
        };
    } & {
        userId: string;
        roleId: string;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
        isActive?: undefined;
    } | {
        id: string;
        deleted: boolean;
        isActive: boolean;
    }>;
}
