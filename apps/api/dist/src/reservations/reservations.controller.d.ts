import { InMemoryService } from '../database/in-memory.service';
import type { Reservation } from '../database/in-memory.service';
type CreateReservationBody = Omit<Reservation, 'id'>;
export declare class ReservationsController {
    private readonly store;
    constructor(store: InMemoryService);
    list(tenantId?: string): Reservation[];
    create(body: CreateReservationBody): Reservation;
    updateStatus(id: string, status: Reservation['status']): Reservation;
}
export {};
