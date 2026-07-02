import { PasswordService } from './password.service';
import { JwtService } from './jwt.service';
import { PrismaService } from '../database/prisma.service';
import { RegisterTenantBody, TenantsService } from '../tenants/tenants.service';
import type { AuthenticatedUser } from './auth.types';
export type LoginBody = {
    email: string;
    password: string;
    tenantSlug: string;
};
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly passwords;
    private readonly tenants;
    constructor(prisma: PrismaService, jwt: JwtService, passwords: PasswordService, tenants: TenantsService);
    register(input: RegisterTenantBody): Promise<{
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
    login(input: LoginBody): Promise<{
        accessToken: string;
        tenant: {
            id: string;
            name: string;
            slug: string | null;
            domain: string | null;
        };
        user: {
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
        expiresIn: number;
        authMethod: string;
    }>;
    currentUser(authenticatedUser: AuthenticatedUser): Promise<{
        tenant: {
            id: string;
            name: string;
            slug: string | null;
            domain: string | null;
        };
        user: {
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
    }>;
}
