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
