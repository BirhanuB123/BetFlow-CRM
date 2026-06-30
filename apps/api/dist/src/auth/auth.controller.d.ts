import { InMemoryService } from '../database/in-memory.service';
type LoginBody = {
    email: string;
    password: string;
    tenantSlug: string;
};
type RegisterBody = {
    companyName: string;
    slug: string;
    ownerName: string;
    ownerEmail: string;
    region?: string;
    plan?: string;
};
export declare class AuthController {
    private readonly store;
    constructor(store: InMemoryService);
    register(body: RegisterBody): {
        tenant: import("../database/in-memory.service").Tenant;
        owner: import("../database/in-memory.service").User;
        roles: import("../database/in-memory.service").Role[];
    };
    login(body: LoginBody): {
        accessToken: string;
        tenant: import("../database/in-memory.service").Tenant | undefined;
        user: import("../database/in-memory.service").User | undefined;
        expiresIn: number;
        authMethod: string;
    };
}
export {};
