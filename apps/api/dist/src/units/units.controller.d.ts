import { InMemoryService } from '../database/in-memory.service';
import type { Unit, UnitStatus } from '../database/in-memory.service';
type CreateUnitBody = Omit<Unit, 'id'>;
export declare class UnitsController {
    private readonly store;
    constructor(store: InMemoryService);
    list(tenantId?: string, status?: UnitStatus): Unit[];
    create(body: CreateUnitBody): Unit;
    updateStatus(id: string, status: UnitStatus, availableFrom?: string): Unit;
}
export {};
