import { PasswordService } from '../auth/password.service';
import { PrismaService } from '../database/prisma.service';
export type InviteUserBody = {
    name: string;
    email: string;
    roleId: string;
    password?: string;
};
export declare class UsersService {
    private readonly prisma;
    private readonly passwords;
    constructor(prisma: PrismaService, passwords: PasswordService);
    listUsers(): Promise<({
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
    inviteUser(input: InviteUserBody): Promise<{
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
    private splitName;
}
