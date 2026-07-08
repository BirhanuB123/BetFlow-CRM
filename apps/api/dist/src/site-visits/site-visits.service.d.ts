import { PrismaService } from '../database/prisma.service';
import { CreateSiteVisitInput, UpdateSiteVisitInput } from './site-visits.types';
export declare class SiteVisitsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string, filters?: {
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
        tenantId: string;
        notes: string | null;
        status: string;
        customerId: string | null;
        date: Date;
        leadId: string | null;
    })[]>;
    get(tenantId: string, id: string): Promise<{
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
        tenantId: string;
        notes: string | null;
        status: string;
        customerId: string | null;
        date: Date;
        leadId: string | null;
    }>;
    create(tenantId: string, userId: string, input: CreateSiteVisitInput): Promise<{
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
        tenantId: string;
        notes: string | null;
        status: string;
        customerId: string | null;
        date: Date;
        leadId: string | null;
    }>;
    update(tenantId: string, userId: string, id: string, input: UpdateSiteVisitInput): Promise<{
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
        tenantId: string;
        notes: string | null;
        status: string;
        customerId: string | null;
        date: Date;
        leadId: string | null;
    }>;
    updateStatus(tenantId: string, userId: string, id: string, status: string): Promise<{
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
        tenantId: string;
        notes: string | null;
        status: string;
        customerId: string | null;
        date: Date;
        leadId: string | null;
    }>;
    remove(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private normalizeStatus;
    private normalizeDate;
    private assertLeadBelongsToTenant;
    private assertCustomerBelongsToTenant;
    private recordAudit;
}
