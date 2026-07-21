/**
 * Re-exports payment types from @betflow/shared.
 * The source of truth is now packages/shared/types/payment.types.ts
 */
export type {
  PaymentStatus,
  PaymentMethod,
  CreatePaymentInput,
  UpdatePaymentInput,
} from '@betflow/shared';

export { PAYMENT_STATUSES, PAYMENT_METHODS } from '@betflow/shared';
