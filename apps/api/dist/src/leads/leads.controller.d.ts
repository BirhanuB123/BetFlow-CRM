import { LeadsService } from './leads.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateLeadInput, UpdateLeadInput, UpdateLeadStatusInput } from './leads.types';
export declare class LeadsController {
    private readonly leads;
    constructor(leads: LeadsService);
    list(user: AuthenticatedUser): import("@prisma/client").Prisma.PrismaPromise<({
        owner: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        source: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        status: string;
        phone: string | null;
        ownerId: string | null;
        company: string | null;
        sourceId: string | null;
    })[]>;
    sources(user: AuthenticatedUser): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
    }[]>;
    create(user: AuthenticatedUser, body: CreateLeadInput): Promise<{
        owner: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        source: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        status: string;
        phone: string | null;
        ownerId: string | null;
        company: string | null;
        sourceId: string | null;
    }>;
    updateStatus(user: AuthenticatedUser, id: string, body: UpdateLeadStatusInput): Promise<{
        owner: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        source: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        status: string;
        phone: string | null;
        ownerId: string | null;
        company: string | null;
        sourceId: string | null;
    }>;
    update(user: AuthenticatedUser, id: string, body: UpdateLeadInput): Promise<{
        owner: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        source: {
            id: string;
            name: string;
        } | null;
    } & {
        id: string;
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        status: string;
        phone: string | null;
        ownerId: string | null;
        company: string | null;
        sourceId: string | null;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
