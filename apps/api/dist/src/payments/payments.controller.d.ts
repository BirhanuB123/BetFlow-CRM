import { PaymentsService } from './payments.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreatePaymentInput, UpdatePaymentInput } from './payments.types';
export declare class PaymentsController {
    private readonly payments;
    constructor(payments: PaymentsService);
    list(user: AuthenticatedUser): import("@prisma/client").Prisma.PrismaPromise<({
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
    get(user: AuthenticatedUser, id: string): Promise<{
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
    create(user: AuthenticatedUser, body: CreatePaymentInput): Promise<{
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
    update(user: AuthenticatedUser, id: string, body: UpdatePaymentInput): Promise<{
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
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
