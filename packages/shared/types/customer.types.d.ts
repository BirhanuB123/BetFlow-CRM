export type CreateCustomerInput = {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    title?: string | null;
    accountId?: string | null;
};
export type UpdateCustomerInput = {
    firstName?: string;
    lastName?: string;
    email?: string | null;
    phone?: string | null;
    title?: string | null;
    accountId?: string | null;
};
export type CustomerType = 'Buyer' | 'Investor' | 'Tenant';
export type CustomerStatus = 'Active' | 'Onboarding' | 'Dormant';
export type Customer = {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: CustomerType;
    owner: string;
    lifetimeValue: string;
    status: CustomerStatus;
};
