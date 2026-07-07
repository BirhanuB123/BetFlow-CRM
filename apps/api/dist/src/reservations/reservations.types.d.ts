export declare const RESERVATION_STATUSES: readonly ["PENDING", "APPROVED", "CANCELLED", "EXPIRED"];
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];
export declare const ACTIVE_RESERVATION_STATUSES: ReservationStatus[];
export type CreateReservationInput = {
    customerId: string;
    unitId: string;
    amount: number | string;
    status?: string;
    date?: string;
};
export type UpdateReservationInput = {
    amount?: number | string;
    date?: string;
};
export type UpdateReservationStatusInput = {
    status: string;
};
