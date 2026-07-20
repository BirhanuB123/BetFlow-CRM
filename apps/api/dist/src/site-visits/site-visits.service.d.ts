import { PrismaService } from '../database/prisma.service';
import { CreateSiteVisitInput, UpdateSiteVisitInput } from './site-visits.types';
export declare class SiteVisitsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filters?: {
        status?: string;
        upcoming?: boolean;
    }): import("@prisma/client").Prisma.PrismaPromise<({
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
    get(id: string): Promise<{
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
    create(userId: string, input: CreateSiteVisitInput): Promise<{
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
    update(userId: string, id: string, input: UpdateSiteVisitInput): Promise<{
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
    updateStatus(userId: string, id: string, status: string): Promise<{
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
    remove(userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private normalizeStatus;
    private normalizeDate;
    private assertLeadBelongsToTenant;
    private assertCustomerBelongsToTenant;
    private recordAudit;
}
