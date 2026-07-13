import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ConvertLeadInput, CreateLeadInput, UpdateLeadInput } from './leads.types';
export declare class LeadsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string): Prisma.PrismaPromise<({
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
        convertedAt: Date | null;
        convertedCustomerId: string | null;
    })[]>;
    listSources(tenantId: string): Prisma.PrismaPromise<{
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
        convertedAt: Date | null;
        convertedCustomerId: string | null;
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
        convertedAt: Date | null;
        convertedCustomerId: string | null;
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
        convertedAt: Date | null;
        convertedCustomerId: string | null;
    }>;
    convert(tenantId: string, userId: string, id: string, input: ConvertLeadInput): Promise<{
        lead: {
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
