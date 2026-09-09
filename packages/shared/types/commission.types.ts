/**
 * Commission tracking types shared across backend and frontend.
 */

export type CommissionPayoutStatus =
  | "PENDING_DOWNPAYMENT"
  | "ELIGIBLE_FOR_PAYOUT"
  | "PARTIALLY_PAID"
  | "PAID"
  | "CANCELLED";

export type CommissionTier = {
  tierName: string;
  minSalesVolume: number;
  ratePercent: number;
  description: string;
};

export type CommissionRecord = {
  id: string;
  contractId: string;
  contractNumber: string;
  dealId?: string | null;
  dealName?: string | null;
  agentId: string;
  agentName: string;
  agentEmail?: string | null;
  customerName: string;
  unitNumber: string;
  projectName: string;
  dealValue: number;
  commissionRate: number; // e.g. 2.0 (%)
  totalCommission: number; // dealValue * (commissionRate / 100)
  collectedPaymentAmount: number;
  collectionProgressPercent: number; // (collected / dealValue) * 100
  paidCommission: number;
  pendingCommission: number;
  status: CommissionPayoutStatus;
  contractDate: string;
  contractDateDual?: string;
  payoutDate?: string | null;
  notes?: string | null;
};

export type AgentCommissionSummary = {
  agentId: string;
  agentName: string;
  agentEmail?: string | null;
  dealsCount: number;
  totalSalesVolume: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  pendingPayout: number;
  averageCommissionRate: number;
};

export type CommissionReport = {
  totalCommissionIncurred: number;
  totalCommissionPaid: number;
  totalCommissionPending: number;
  eligiblePayoutsCount: number;
  totalDealsCommissioned: number;
  averageCommissionRate: number;
  topEarners: AgentCommissionSummary[];
  records: CommissionRecord[];
};
