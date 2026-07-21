import { apiFetch } from "@/lib/api";
import type {
  CreatePaymentInput,
  UpdatePaymentInput,
} from "@betflow/shared";

export type PaymentRecord = {
  id: string;
  amount: number | string;
  method: string;
  status: string;
  date?: string;
  contractId?: string | null;
  reservationId?: string | null;
};

/**
 * Service for interacting with Payment API endpoints.
 */
export const paymentsService = {
  /** Fetch all payments */
  async getPayments(): Promise<PaymentRecord[]> {
    return apiFetch<PaymentRecord[]>("/payments");
  },

  /** Create a new payment */
  async createPayment(input: CreatePaymentInput): Promise<PaymentRecord> {
    return apiFetch<PaymentRecord>("/payments", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  /** Update payment status/details */
  async updatePayment(id: string, input: UpdatePaymentInput): Promise<PaymentRecord> {
    return apiFetch<PaymentRecord>(`/payments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
};
