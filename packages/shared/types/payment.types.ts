/**
 * Shared payment types used by both apps/api and apps/web.
 * Extracted from apps/api/src/payments/payments.types.ts
 */

export const PAYMENT_STATUSES = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ['BANK_TRANSFER', 'CASH', 'CARD', 'CHEQUE'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// ─── Input Types (API) ─────────────────────────────────────────────────────────

export type CreatePaymentInput = {
  amount: number | string;
  method: string;
  contractId?: string | null;
  reservationId?: string | null;
  date?: string;
  status?: string;
};

export type UpdatePaymentInput = {
  amount?: number | string;
  method?: string;
  contractId?: string | null;
  reservationId?: string | null;
  date?: string;
  status?: string;
};
