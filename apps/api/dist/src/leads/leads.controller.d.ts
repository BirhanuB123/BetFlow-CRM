import { LeadsService } from './leads.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateLeadInput, UpdateLeadInput, UpdateLeadStatusInput } from './leads.types';
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
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        status: string;
        phone: string | null;
        company: string | null;
        sourceId: string | null;
        ownerId: string | null;
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
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        status: string;
        phone: string | null;
        company: string | null;
        sourceId: string | null;
        ownerId: string | null;
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
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        status: string;
        phone: string | null;
        company: string | null;
        sourceId: string | null;
        ownerId: string | null;
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
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        status: string;
        phone: string | null;
        company: string | null;
        sourceId: string | null;
        ownerId: string | null;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
