import { PrismaService } from '../database/prisma.service';
import { CreatePaymentInput, UpdatePaymentInput } from './payments.types';
export declare class PaymentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: string): import("@prisma/client").Prisma.PrismaPromise<({
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
        tenantId: string;
        createdAt: Date;
        status: string;
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        method: string;
        contractId: string | null;
        reservationId: string | null;
    })[]>;
    get(tenantId: string, id: string): Promise<{
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
        tenantId: string;
        createdAt: Date;
        status: string;
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        method: string;
        contractId: string | null;
        reservationId: string | null;
    }>;
    create(tenantId: string, userId: string, input: CreatePaymentInput): Promise<{
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
        tenantId: string;
        createdAt: Date;
        status: string;
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        method: string;
        contractId: string | null;
        reservationId: string | null;
    }>;
    update(tenantId: string, userId: string, id: string, input: UpdatePaymentInput): Promise<{
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
        tenantId: string;
        createdAt: Date;
        status: string;
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        method: string;
        contractId: string | null;
        reservationId: string | null;
    }>;
    remove(tenantId: string, userId: string, id: string): Promise<{
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
