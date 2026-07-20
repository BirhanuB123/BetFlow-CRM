import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ConvertLeadInput, CreateLeadInput, UpdateLeadInput } from './leads.types';
export declare class LeadsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Prisma.PrismaPromise<({
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
    listSources(): Prisma.PrismaPromise<{
        id: string;
        name: string;
    }[]>;
    create(userId: string, input: CreateLeadInput): Promise<{
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
    update(userId: string, id: string, input: UpdateLeadInput): Promise<{
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
    remove(userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    updateStatus(userId: string, id: string, status: string): Promise<{
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
    convert(userId: string, id: string, input: ConvertLeadInput): Promise<{
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
