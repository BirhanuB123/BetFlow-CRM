import { PrismaService } from '../database/prisma.service';
import { CreatePaymentInput, UpdatePaymentInput } from './payments.types';
export declare class PaymentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): import("@prisma/client").Prisma.PrismaPromise<({
        reservation: {
            id: string;
            status: string;
        } | null;
        contract: {
            id: string;
            status: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        status: string;
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        method: string;
        contractId: string | null;
        reservationId: string | null;
    })[]>;
    get(id: string): Promise<{
        reservation: {
            id: string;
            status: string;
        } | null;
        contract: {
            id: string;
            status: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        status: string;
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        method: string;
        contractId: string | null;
        reservationId: string | null;
    }>;
    create(userId: string, input: CreatePaymentInput): Promise<{
        reservation: {
            id: string;
            status: string;
        } | null;
        contract: {
            id: string;
            status: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        status: string;
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        method: string;
        contractId: string | null;
        reservationId: string | null;
    }>;
    update(userId: string, id: string, input: UpdatePaymentInput): Promise<{
        reservation: {
            id: string;
            status: string;
        } | null;
        contract: {
            id: string;
            status: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        status: string;
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        method: string;
        contractId: string | null;
        reservationId: string | null;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
    private assertExactlyOneTarget;
    private normalizeAmount;
    private normalizeDate;
    private assertContractBelongsToTenant;
    private assertReservationBelongsToTenant;
    private recordAudit;
}
