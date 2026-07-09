import { PrismaService } from '../database/prisma.service';
import { CreateLeadInput, UpdateLeadInput } from './leads.types';
export declare class LeadsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string): import("@prisma/client").Prisma.PrismaPromise<({
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
    listSources(tenantId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
    }[]>;
    create(tenantId: string, userId: string, input: CreateLeadInput): Promise<{
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
    update(tenantId: string, userId: string, id: string, input: UpdateLeadInput): Promise<{
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
    remove(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    updateStatus(tenantId: string, userId: string, id: string, status: string): Promise<{
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
    private normalizeStatus;
    private assertSourceBelongsToTenant;
    private recordAudit;
}
