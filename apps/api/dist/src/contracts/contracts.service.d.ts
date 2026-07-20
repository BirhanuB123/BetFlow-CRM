import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateContractInput, UpdateContractInput } from './contracts.types';
export declare class ContractsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Prisma.PrismaPromise<({
        unit: {
            id: string;
            status: string;
            unitNumber: string;
            type: string;
        };
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        };
        deal: {
            id: string;
            name: string;
        } | null;
        _count: {
            payments: number;
            schedules: number;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        customerId: string;
        unitId: string;
        dealId: string | null;
        startDate: Date;
        endDate: Date | null;
        totalAmt: Prisma.Decimal;
    })[]>;
    get(id: string): Promise<{
        unit: {
            id: string;
            status: string;
            unitNumber: string;
            type: string;
        };
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        };
        deal: {
            id: string;
            name: string;
        } | null;
        _count: {
            payments: number;
            schedules: number;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        customerId: string;
        unitId: string;
        dealId: string | null;
        startDate: Date;
        endDate: Date | null;
        totalAmt: Prisma.Decimal;
    }>;
    create(userId: string, input: CreateContractInput): Promise<{
        unit: {
            id: string;
            status: string;
            unitNumber: string;
            type: string;
        };
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        };
        deal: {
            id: string;
            name: string;
        } | null;
        _count: {
            payments: number;
            schedules: number;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        customerId: string;
        unitId: string;
        dealId: string | null;
        startDate: Date;
        endDate: Date | null;
        totalAmt: Prisma.Decimal;
    }>;
    update(userId: string, id: string, input: UpdateContractInput): Promise<{
        unit: {
            id: string;
            status: string;
            unitNumber: string;
            type: string;
        };
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        };
        deal: {
            id: string;
            name: string;
        } | null;
        _count: {
            payments: number;
            schedules: number;
        };
    } & {
        id: string;
        createdAt: Date;
        status: string;
        customerId: string;
        unitId: string;
        dealId: string | null;
        startDate: Date;
        endDate: Date | null;
        totalAmt: Prisma.Decimal;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private normalizeAmount;
    private normalizeDate;
    private assertCustomerBelongsToTenant;
    private assertUnitBelongsToTenant;
    private assertDealBelongsToTenant;
    private recordAudit;
}
