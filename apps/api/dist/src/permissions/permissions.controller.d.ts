import { InMemoryService } from '../database/in-memory.service';
export declare class PermissionsController {
    private readonly store;
    constructor(store: InMemoryService);
    list(): import("../database/in-memory.service").Permission[];
}
