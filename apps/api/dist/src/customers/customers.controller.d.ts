import { Customer, InMemoryService } from '../database/in-memory.service';
type CreateCustomerBody = Omit<Customer, 'id'>;
export declare class CustomersController {
    private readonly store;
    constructor(store: InMemoryService);
    list(tenantId?: string): Customer[];
    create(body: CreateCustomerBody): Customer;
}
export {};
