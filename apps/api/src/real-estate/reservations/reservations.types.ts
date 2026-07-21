export const RESERVATION_STATUSES = [
  'PENDING',
  'APPROVED',
  'CANCELLED',
  'EXPIRED',
] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const ACTIVE_RESERVATION_STATUSES: ReservationStatus[] = [
  'PENDING',
  'APPROVED',
];

export type CreateReservationInput = {
  customerId: string;
  unitId: string;
  amount: number | string;
  status?: string;
  date?: string;
};

// Status is intentionally excluded: it changes unit inventory state, so it
// must go through PATCH /reservations/:id/status.
export type UpdateReservationInput = {
  amount?: number | string;
  date?: string;
};

export type UpdateReservationStatusInput = {
  status: string;
};
