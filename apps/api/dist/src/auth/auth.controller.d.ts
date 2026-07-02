import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './auth.types';
type LoginBody = {
    email: string;
    password: string;
    tenantSlug: string;
};
type RegisterBody = {
    companyName: string;
    slug: string;
    ownerName: string;
    ownerEmail: string;
    password?: string;
    region?: string;
    plan?: string;
};
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(body: RegisterBody): Promise<{
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
    login(body: LoginBody): Promise<{
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
    me(user: AuthenticatedUser): Promise<{
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
export {};
