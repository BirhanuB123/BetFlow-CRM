import { SiteVisitsService } from './site-visits.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateSiteVisitInput, UpdateSiteVisitInput, UpdateSiteVisitStatusInput } from './site-visits.types';
export declare class SiteVisitsController {
    private readonly siteVisits;
    constructor(siteVisits: SiteVisitsService);
    list(user: AuthenticatedUser, status?: string, upcoming?: string): import("@prisma/client").Prisma.PrismaPromise<({
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        lead: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        notes: string | null;
        status: string;
        customerId: string | null;
        date: Date;
        leadId: string | null;
    })[]>;
    get(user: AuthenticatedUser, id: string): Promise<{
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        lead: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        notes: string | null;
        status: string;
        customerId: string | null;
        date: Date;
        leadId: string | null;
    }>;
    create(user: AuthenticatedUser, body: CreateSiteVisitInput): Promise<{
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        lead: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        notes: string | null;
        status: string;
        customerId: string | null;
        date: Date;
        leadId: string | null;
    }>;
    updateStatus(user: AuthenticatedUser, id: string, body: UpdateSiteVisitStatusInput): Promise<{
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        lead: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        notes: string | null;
        status: string;
        customerId: string | null;
        date: Date;
        leadId: string | null;
    }>;
    update(user: AuthenticatedUser, id: string, body: UpdateSiteVisitInput): Promise<{
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        lead: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        notes: string | null;
        status: string;
        customerId: string | null;
        date: Date;
        leadId: string | null;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
