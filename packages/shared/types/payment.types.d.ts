export declare const PAYMENT_STATUSES: readonly [
  "PENDING",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export declare const PAYMENT_METHODS: readonly [
  "BANK_TRANSFER",
  "CASH",
  "CARD",
  "CHEQUE",
];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
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
