import type { AuthenticatedUser } from '../auth/auth.types';
import { UsersService } from './users.service';
import type { InviteUserBody } from './users.service';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    list(user: AuthenticatedUser): Promise<{
        id: string;
        tenantId: string;
        name: string;
        email: string;
        roleId: string | undefined;
        roleName: string | undefined;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    invite(user: AuthenticatedUser, body: InviteUserBody): Promise<{
        id: string;
        tenantId: string;
        name: string;
        email: string;
        roleId: string | undefined;
        roleName: string | undefined;
        status: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
