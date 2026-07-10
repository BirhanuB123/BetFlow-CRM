import { LeadsService } from './leads.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { ConvertLeadInput, CreateLeadInput, UpdateLeadInput, UpdateLeadStatusInput } from './leads.types';
export declare class LeadsController {
    private readonly leads;
    constructor(leads: LeadsService);
    list(user: AuthenticatedUser): import("@prisma/client").Prisma.PrismaPromise<({
        source: {
            id: string;
            name: string;
        } | null;
        owner: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        firstName: string;
        lastName: string;
        company: string | null;
        email: string | null;
        phone: string | null;
        status: string;
        sourceId: string | null;
        ownerId: string | null;
        createdAt: Date;
        convertedAt: Date | null;
        convertedCustomerId: string | null;
    })[]>;
    sources(user: AuthenticatedUser): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
    }[]>;
    create(user: AuthenticatedUser, body: CreateLeadInput): Promise<{
        source: {
            id: string;
            name: string;
        } | null;
        owner: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        firstName: string;
        lastName: string;
        company: string | null;
        email: string | null;
        phone: string | null;
        status: string;
        sourceId: string | null;
        ownerId: string | null;
        createdAt: Date;
        convertedAt: Date | null;
        convertedCustomerId: string | null;
    }>;
    updateStatus(user: AuthenticatedUser, id: string, body: UpdateLeadStatusInput): Promise<{
        source: {
            id: string;
            name: string;
        } | null;
        owner: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        firstName: string;
        lastName: string;
        company: string | null;
        email: string | null;
        phone: string | null;
        status: string;
        sourceId: string | null;
        ownerId: string | null;
        createdAt: Date;
        convertedAt: Date | null;
        convertedCustomerId: string | null;
    }>;
    convert(user: AuthenticatedUser, id: string, body: ConvertLeadInput): Promise<{
        lead: {
            source: {
                id: string;
                name: string;
            } | null;
            owner: {
                id: string;
                firstName: string;
                lastName: string;
            } | null;
        } & {
            id: string;
            tenantId: string;
            firstName: string;
            lastName: string;
            company: string | null;
            email: string | null;
            phone: string | null;
            status: string;
            sourceId: string | null;
            ownerId: string | null;
            createdAt: Date;
            convertedAt: Date | null;
            convertedCustomerId: string | null;
        };
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        };
        account: {
            id: string;
            name: string;
        } | null;
        deal: {
            id: string;
            name: string;
        } | null;
    }>;
    update(user: AuthenticatedUser, id: string, body: UpdateLeadInput): Promise<{
        source: {
            id: string;
            name: string;
        } | null;
        owner: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        firstName: string;
        lastName: string;
        company: string | null;
        email: string | null;
        phone: string | null;
        status: string;
        sourceId: string | null;
        ownerId: string | null;
        createdAt: Date;
        convertedAt: Date | null;
        convertedCustomerId: string | null;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
