import { InMemoryService } from '../database/in-memory.service';
type InviteUserBody = {
    tenantId: string;
    name: string;
    email: string;
    roleId: string;
};
export declare class UsersController {
    private readonly store;
    constructor(store: InMemoryService);
    list(tenantId?: string): import("../database/in-memory.service").User[];
    invite(body: InviteUserBody): import("../database/in-memory.service").User;
}
export {};
