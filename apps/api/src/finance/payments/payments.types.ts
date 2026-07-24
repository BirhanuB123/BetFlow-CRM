export const REAL_ESTATE_MILESTONES = [
  'DOWNPAYMENT_30',
  'FOUNDATION_SLAB_20',
  'STRUCTURE_SLAB_20',
  'FINISHING_TILE_20',
  'HANDOVER_KEYS_10',
] as const;

export type RealEstateMilestone = (typeof REAL_ESTATE_MILESTONES)[number];

export const PAYMENT_METHODS = [
  'CBE_BANK_TRANSFER',
  'TELEBIRR',
  'CBE_BIRR',
  'CASH_DEPOSIT',
  'CHECK',
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type CreatePaymentInput = {
  amount: number | string;
  method?: string;
  receiptNumber?: string;
  contractId?: string;
  reservationId?: string;
  scheduleId?: string;
  date?: string;
  notes?: string;
  status?: string;
};

export type UpdatePaymentInput = {
  amount?: number | string;
  method?: string;
  receiptNumber?: string;
  contractId?: string;
  reservationId?: string;
  scheduleId?: string;
  date?: string;
  notes?: string;
  status?: string;
};

export type CreateMilestoneScheduleInput = {
  contractId: string;
  milestoneName: RealEstateMilestone;
  percentage: number;
  dueDate: string;
  amount: number | string;
  notes?: string;
};

export type UpdatePaymentScheduleInput = {
  milestoneName?: RealEstateMilestone;
  percentage?: number;
  dueDate?: string;
  amount?: number | string;
  paidAmount?: number | string;
  status?: string;
  notes?: string;
};
