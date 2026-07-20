import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateReservationInput, UpdateReservationInput } from './reservations.types';
export declare class ReservationsService {
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
        _count: {
            payments: number;
        };
    } & {
        id: string;
        status: string;
        customerId: string;
        unitId: string;
        date: Date;
        amount: Prisma.Decimal;
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
        _count: {
            payments: number;
        };
    } & {
        id: string;
        status: string;
        customerId: string;
        unitId: string;
        date: Date;
        amount: Prisma.Decimal;
    }>;
    create(userId: string, input: CreateReservationInput): Promise<{
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
        status: string;
        customerId: string;
        unitId: string;
        date: Date;
        amount: Prisma.Decimal;
    }>;
    update(userId: string, id: string, input: UpdateReservationInput): Promise<{
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
        status: string;
        customerId: string;
        unitId: string;
        date: Date;
        amount: Prisma.Decimal;
    }>;
    updateStatus(userId: string, id: string, status: string): Promise<{
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
        status: string;
        customerId: string;
        unitId: string;
        date: Date;
        amount: Prisma.Decimal;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private normalizeStatus;
    private normalizeAmount;
    private normalizeDate;
    private assertCustomerBelongsToTenant;
    private recordAudit;
}
