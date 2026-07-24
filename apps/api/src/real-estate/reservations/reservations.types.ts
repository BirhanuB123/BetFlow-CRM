export const RESERVATION_STATUSES = [
  'PENDING',
  'APPROVED',
  'CONVERTED_TO_CONTRACT',
  'CANCELLED',
  'EXPIRED',
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const ACTIVE_RESERVATION_STATUSES: ReservationStatus[] = [
  'PENDING',
  'APPROVED',
];

export type CreateReservationInput = {
  reservationNumber?: string;
  customerId: string;
  unitId: string;
  amount: number | string;
  holdPeriodDays?: number;
  expiryDate?: string;
  paymentMethod?: string;
  receiptNumber?: string;
  notes?: string;
  status?: string;
  date?: string;
};

export type UpdateReservationInput = {
  reservationNumber?: string;
  amount?: number | string;
  holdPeriodDays?: number;
  expiryDate?: string;
  paymentMethod?: string;
  receiptNumber?: string;
  notes?: string;
  date?: string;
};

export type UpdateReservationStatusInput = {
  status: string;
};
