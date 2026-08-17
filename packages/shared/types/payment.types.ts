/**
 * Shared payment types used by both apps/api and apps/web.
 * Extracted from apps/api/src/payments/payments.types.ts
 */

export const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "OVERDUE",
  "CANCELLED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = [
  "BANK_TRANSFER",
  "CASH",
  "CARD",
  "CHEQUE",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// ─── Input Types (API) ─────────────────────────────────────────────────────────

export type CreatePaymentInput = {
  amount: number | string;
  method: string;
  contractId?: string | null;
  reservationId?: string | null;
  scheduleId?: string | null;
  date?: string;
  status?: string;
  receiptNumber?: string;
  bankName?: string;
};

export type VerifyPaymentInput = {
  paymentId: string;
  status: "COMPLETED" | "REJECTED";
  bankName?: string;
  receiptNumber?: string;
  notes?: string;
};

export type CustomMilestoneInput = {
  milestoneName: string;
  amount: number;
  percentage?: number;
  dueDate: string;
  notes?: string;
};

export type OverduePenaltyRolloverInput = {
  scheduleId: string;
  penaltyRatePercent?: number;
  penaltyFlatFeeETB?: number;
  rolloverDueDate: string;
};

export type UpdatePaymentInput = {
  amount?: number | string;
  method?: string;
  contractId?: string | null;
  reservationId?: string | null;
  date?: string;
  status?: string;
  bankName?: string;
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
  status: "PENDING" | "PAID" | "LATE";
};

export type PaymentPlanCalculation = {
  unitPrice: number;
  downPaymentAmount: number;
  handoverAmount: number;
  installmentAmount: number;
  schedule: PaymentScheduleItem[];
};

// ─── Contract Builder & Multi-Level Approval Types ─────────────────────────────

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export type GenerateContractInput = {
  templateType:
    "ETHIOPIAN_REAL_ESTATE_SALE" | "COMMERCIAL_LEASE" | "RESERVATION_AGREEMENT";
  customerId: string;
  unitId: string;
  agreedPrice: number;
  currency: "ETB" | "USD";
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
  currency: "ETB" | "USD";
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
  currency: "ETB" | "USD";
  discountPercent: number;
  reason: string;
  status: ApprovalStatus;
  createdAt: string;
};

// ─── E-Signature & Audit Trail Types ───────────────────────────────────────────

export type SignerRole = "BUYER" | "SELLER_REP" | "WITNESS";

export type ContractSignatureInput = {
  contractId: string;
  signerName: string;
  signerEmail?: string;
  signerRole: SignerRole;
  signatureDataUrl: string; // Base64 PNG image data
};

export type SignatureAuditItem = {
  id: string;
  contractId: string;
  signerName: string;
  signerEmail?: string | null;
  signerRole: SignerRole;
  signatureDataUrl: string;
  ipAddress: string;
  userAgent: string;
  verificationHash: string;
  signedAt: string;
};

// ─── Additional UI & Document Types ────────────────────────────────────────────

export type ApiContract = {
  id: string;
  contractNumber?: string | null;
  contractType: string;
  startDate: string;
  endDate?: string | null;
  totalAmt?: string;
  totalPrice?: number;
  downPaymentAmt?: string | null;
  downpaymentAmount?: number;
  paymentPlan?: string | null;
  status: string;
  notes?: string | null;
  customer: { id: string; firstName: string; lastName: string };
  unit: { id: string; unitNumber: string; type: string; status: string };
  deal?: { id: string; name: string } | null;
  _count?: { payments: number; schedules: number };
  createdAt?: string;
  updatedAt?: string;
};

export type DocumentStatus = "PENDING_REVIEW" | "VERIFIED" | "REJECTED" | "EXPIRED";
export type EntityType = "CUSTOMER" | "RESERVATION" | "CONTRACT" | "PAYMENT";

export type DocumentRecord = {
  id: string;
  name: string;
  title?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  sizeBytes?: number | null;
  mimeType: string | null;
  category: string;
  status: DocumentStatus;
  entityType: string;
  entityId: string;
  uploadedAt: string;
  expiresAt?: string | null;
  rejectionReason?: string | null;
  uploadedBy?: { id: string; name: string } | null;
  reviewedBy?: { id: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PaymentAgingRow = {
  agingCategory: string;
  invoiceCount: number;
  totalOutstandingETB: number;
};

