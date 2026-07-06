import { CustomersService } from './customers.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { CreateCustomerInput, UpdateCustomerInput } from './customers.types';
export declare class CustomersController {
    private readonly customers;
    constructor(customers: CustomersService);
    list(user: AuthenticatedUser): import("@prisma/client").Prisma.PrismaPromise<({
        _count: {
            deals: number;
            reservations: number;
            contracts: number;
        };
    } & {
        id: string;
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        phone: string | null;
    })[]>;
    get(user: AuthenticatedUser, id: string): Promise<{
        _count: {
            deals: number;
            reservations: number;
            contracts: number;
        };
    } & {
        id: string;
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        phone: string | null;
    }>;
    create(user: AuthenticatedUser, body: CreateCustomerInput): Promise<{
        _count: {
            deals: number;
            reservations: number;
            contracts: number;
        };
    } & {
        id: string;
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        phone: string | null;
    }>;
    update(user: AuthenticatedUser, id: string, body: UpdateCustomerInput): Promise<{
        _count: {
            deals: number;
            reservations: number;
            contracts: number;
        };
    } & {
        id: string;
        email: string | null;
        tenantId: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
        phone: string | null;
    }>;
    remove(user: AuthenticatedUser, id: string): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
