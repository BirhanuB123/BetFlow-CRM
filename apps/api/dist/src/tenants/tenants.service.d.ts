import { User } from '@prisma/client';
import { PasswordService } from '../auth/password.service';
import { PrismaService } from '../database/prisma.service';
export declare const SUPPORTED_CURRENCIES: readonly ["ETB", "USD", "EUR", "GBP", "KES", "AED"];
export type RegisterTenantBody = {
    companyName: string;
    slug: string;
    ownerName: string;
    ownerEmail: string;
    password?: string;
    region?: string;
    plan?: string;
};
export type UpdateTenantBody = {
    name?: string;
    domain?: string;
    currency?: string;
};
export declare class TenantsService {
    private readonly prisma;
    private readonly passwords;
    constructor(prisma: PrismaService, passwords: PasswordService);
    registerTenant(input: RegisterTenantBody): Promise<{
        tenant: {
            id: string;
            name: string;
            slug: string | null;
            domain: string | null;
            currency: string;
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
    listTenants(): Promise<{
        id: string;
        name: string;
        slug: string | null;
        domain: string | null;
        currency: string;
        region: string;
        plan: string;
        status: string;
        ownerUserId: string | undefined;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getTenant(id: string): Promise<{
        id: string;
        name: string;
        slug: string | null;
        domain: string | null;
        currency: string;
        region: string;
        plan: string;
        status: string;
        ownerUserId: string | undefined;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateTenant(authenticatedTenantId: string, id: string, input: UpdateTenantBody): Promise<{
        id: string;
        name: string;
        slug: string | null;
        domain: string | null;
        currency: string;
        region: string;
        plan: string;
        status: string;
        ownerUserId: string | undefined;
        createdAt: Date;
        updatedAt: Date;
    }>;
    serializeUser(user: User & {
        roles?: {
            role: {
                id: string;
                name: string;
            };
        }[];
    }): {
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
    serializeRole(role: {
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
    }): {
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
    };
    private assertTenantRegistration;
    private splitName;
    private normalizeCurrency;
    private serializeTenant;
    private isUniqueViolation;
    private readonly userInclude;
}
