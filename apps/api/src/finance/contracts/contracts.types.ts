export const CONTRACT_TYPES = [
  'SALES_AGREEMENT',
  'RESERVATION_AGREEMENT',
  'COMMERCIAL_LEASE',
] as const;

export type ContractType = (typeof CONTRACT_TYPES)[number];

export const CONTRACT_STATUSES = [
  'ACTIVE',
  'PENDING_SIGNATURE',
  'SIGNED',
  'CANCELLED',
] as const;

export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

export type CreateContractInput = {
  contractNumber?: string;
  contractType?: string;
  customerId: string;
  unitId: string;
  dealId?: string | null;
  startDate: string;
  endDate?: string | null;
  totalAmt: number | string;
  downPaymentAmt?: number | string | null;
  paymentPlan?: string | null;
  status?: string;
  notes?: string | null;
};

export type UpdateContractInput = {
  contractNumber?: string;
  contractType?: string;
  customerId?: string;
  unitId?: string;
  dealId?: string | null;
  startDate?: string;
  endDate?: string | null;
  totalAmt?: number | string;
  downPaymentAmt?: number | string | null;
  paymentPlan?: string | null;
  status?: string;
  notes?: string | null;
};
