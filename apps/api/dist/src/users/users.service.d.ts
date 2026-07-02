import { PasswordService } from '../auth/password.service';
import { PrismaService } from '../database/prisma.service';
import { TenantsService } from '../tenants/tenants.service';
export type InviteUserBody = {
    tenantId: string;
    name: string;
    email: string;
    roleId: string;
    password?: string;
};
export declare class UsersService {
    private readonly prisma;
    private readonly passwords;
    private readonly tenants;
    constructor(prisma: PrismaService, passwords: PasswordService, tenants: TenantsService);
    listUsers(tenantId?: string): Promise<{
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
    inviteUser(input: InviteUserBody): Promise<{
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
    private splitName;
}
