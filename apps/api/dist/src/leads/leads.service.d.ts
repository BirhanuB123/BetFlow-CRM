import { PrismaService } from '../database/prisma.service';
import { CreateLeadInput } from './leads.types';
export declare class LeadsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string): import("@prisma/client").Prisma.PrismaPromise<({
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
        sourceId: string | null;
    })[]>;
    create(tenantId: string, userId: string, input: CreateLeadInput): Promise<{
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
        sourceId: string | null;
    }>;
    updateStatus(tenantId: string, userId: string, id: string, status: string): Promise<{
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
        sourceId: string | null;
    }>;
    private normalizeStatus;
    private assertSourceBelongsToTenant;
    private recordAudit;
}
