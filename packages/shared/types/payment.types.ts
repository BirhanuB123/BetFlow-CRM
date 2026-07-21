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

// ─── Payment Plan & Installment Generator Types ────────────────────────────────

export type PaymentPlanInput = {
  unitPrice: number;
  downPaymentPercent: number;
  installmentsCount: number;
  handoverPercent: number;
  startDate?: string;
};

export type PaymentScheduleItem = {
  installmentNumber: number;
  label: string;
  dueDate: string;
  amount: number;
  percentage: number;
  status: 'PENDING' | 'PAID' | 'LATE';
};

export type PaymentPlanCalculation = {
  unitPrice: number;
  downPaymentAmount: number;
  handoverAmount: number;
  installmentAmount: number;
  schedule: PaymentScheduleItem[];
};
