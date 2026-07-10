import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ConvertLeadInput, CreateLeadInput, UpdateLeadInput } from './leads.types';
export declare class LeadsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string): Prisma.PrismaPromise<({
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
    listSources(tenantId: string): Prisma.PrismaPromise<{
        id: string;
        name: string;
    }[]>;
    create(tenantId: string, userId: string, input: CreateLeadInput): Promise<{
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
    update(tenantId: string, userId: string, id: string, input: UpdateLeadInput): Promise<{
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
    remove(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    updateStatus(tenantId: string, userId: string, id: string, status: string): Promise<{
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
    convert(tenantId: string, userId: string, id: string, input: ConvertLeadInput): Promise<{
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
    private normalizeStatus;
    private assertSourceBelongsToTenant;
    private recordAudit;
}
