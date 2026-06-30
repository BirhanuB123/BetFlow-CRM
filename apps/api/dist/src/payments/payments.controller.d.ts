import { InMemoryService } from '../database/in-memory.service';
import type { FinanceApproval, PaymentScheduleItem, PaymentTransaction, ReceiptUpload } from '../database/in-memory.service';
type CreatePaymentScheduleBody = Omit<PaymentScheduleItem, 'id'>;
type CreatePaymentTransactionBody = Omit<PaymentTransaction, 'id'>;
type CreateReceiptUploadBody = Omit<ReceiptUpload, 'id' | 'uploadedAt'>;
type CreateFinanceApprovalBody = Omit<FinanceApproval, 'id' | 'submittedAt'>;
export declare class PaymentsController {
    private readonly store;
    constructor(store: InMemoryService);
    listSchedule(tenantId?: string, reservationId?: string): PaymentScheduleItem[];
    createSchedule(body: CreatePaymentScheduleBody): PaymentScheduleItem;
    listTransactions(tenantId?: string, reservationId?: string): PaymentTransaction[];
    createTransaction(body: CreatePaymentTransactionBody): PaymentTransaction;
    listReceipts(tenantId?: string, paymentId?: string): ReceiptUpload[];
    createReceipt(body: CreateReceiptUploadBody): ReceiptUpload;
    listApprovals(tenantId?: string): FinanceApproval[];
    createApproval(body: CreateFinanceApprovalBody): FinanceApproval;
    updateApprovalStatus(id: string, status: FinanceApproval['status'], note?: string): FinanceApproval;
}
export {};
