import { ReservationsService } from './reservations.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateReservationInput, UpdateReservationInput, UpdateReservationStatusInput } from './reservations.types';
export declare class ReservationsController {
    private readonly reservations;
    constructor(reservations: ReservationsService);
    list(user: AuthenticatedUser): import("@prisma/client").Prisma.PrismaPromise<({
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
        amount: import("@prisma/client-runtime-utils").Decimal;
    })[]>;
    get(user: AuthenticatedUser, id: string): Promise<{
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
        amount: import("@prisma/client-runtime-utils").Decimal;
    }>;
    create(user: AuthenticatedUser, body: CreateReservationInput): Promise<{
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
        amount: import("@prisma/client-runtime-utils").Decimal;
    }>;
    updateStatus(user: AuthenticatedUser, id: string, body: UpdateReservationStatusInput): Promise<{
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
        amount: import("@prisma/client-runtime-utils").Decimal;
    }>;
    update(user: AuthenticatedUser, id: string, body: UpdateReservationInput): Promise<{
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
        amount: import("@prisma/client-runtime-utils").Decimal;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
