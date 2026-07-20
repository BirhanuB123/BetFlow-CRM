import type { AuthenticatedUser } from '../auth/auth.types';
import { UsersService } from './users.service';
import type { InviteUserBody } from './users.service';
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    list(user: AuthenticatedUser): Promise<({
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
    })[]>;
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
}
