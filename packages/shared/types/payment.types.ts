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

// ─── Contract Builder & Multi-Level Approval Types ─────────────────────────────

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type GenerateContractInput = {
  templateType: 'ETHIOPIAN_REAL_ESTATE_SALE' | 'COMMERCIAL_LEASE' | 'RESERVATION_AGREEMENT';
  customerId: string;
  unitId: string;
  agreedPrice: number;
  currency: 'ETB' | 'USD';
  discountPercent?: number;
  downPaymentPercent?: number;
  installmentsCount?: number;
  handoverPercent?: number;
  specialTerms?: string;
};

export type ContractTemplateResult = {
  contractId: string;
  title: string;
  buyerName: string;
  unitNumber: string;
  buildingName: string;
  agreedPrice: number;
  currency: 'ETB' | 'USD';
  discountPercent: number;
  requiresApproval: boolean;
  approvalReason?: string;
  approvalStatus: ApprovalStatus;
  htmlContent: string;
};

export type ApprovalRequestItem = {
  id: string;
  contractId: string;
  title: string;
  requesterName: string;
  buyerName: string;
  amount: number;
  currency: 'ETB' | 'USD';
  discountPercent: number;
  reason: string;
  status: ApprovalStatus;
  createdAt: string;
};
