import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateReservationInput, UpdateReservationInput } from './reservations.types';
export declare class ReservationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string): Prisma.PrismaPromise<({
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
        _count: {
            payments: number;
        };
    } & {
        id: string;
        tenantId: string;
        status: string;
        customerId: string;
        unitId: string;
        date: Date;
        amount: Prisma.Decimal;
    })[]>;
    get(tenantId: string, id: string): Promise<{
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
        _count: {
            payments: number;
        };
    } & {
        id: string;
        tenantId: string;
        status: string;
        customerId: string;
        unitId: string;
        date: Date;
        amount: Prisma.Decimal;
    }>;
    create(tenantId: string, userId: string, input: CreateReservationInput): Promise<{
        unit: {
            status: string;
            id: string;
            unitNumber: string;
            type: string;
        };
        customer: {
            id: string;
            firstName: string;
            lastName: string;
        };
        _count: {
            payments: number;
        };
        id: string;
        tenantId: string;
        status: string;
        customerId: string;
        unitId: string;
        date: Date;
        amount: Prisma.Decimal;
    }>;
    update(tenantId: string, userId: string, id: string, input: UpdateReservationInput): Promise<{
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
        _count: {
            payments: number;
        };
    } & {
        id: string;
        tenantId: string;
        status: string;
        customerId: string;
        unitId: string;
        date: Date;
        amount: Prisma.Decimal;
    }>;
    updateStatus(tenantId: string, userId: string, id: string, status: string): Promise<{
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
        _count: {
            payments: number;
        };
    } & {
        id: string;
        tenantId: string;
        status: string;
        customerId: string;
        unitId: string;
        date: Date;
        amount: Prisma.Decimal;
    }>;
    remove(tenantId: string, userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private normalizeStatus;
    private normalizeAmount;
    private normalizeDate;
    private assertCustomerBelongsToTenant;
    private recordAudit;
}
