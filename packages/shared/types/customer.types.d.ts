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
export type CustomerType = "Buyer" | "Investor" | "Tenant";
export type CustomerStatus = "Active" | "Onboarding" | "Dormant";
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
export type ApiCustomer = {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    nationalId?: string | null;
    tinNumber?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    createdAt?: string;
    updatedAt?: string;
    _count: {
        deals: number;
        reservations: number;
        contracts: number;
    };
};
export type CustomerOption = {
    id: string;
    firstName: string;
    lastName: string;
};
export type NewCustomer = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationalId?: string;
    tinNumber?: string;
    address?: string;
    city?: string;
    country?: string;
};
export type CustomerDetail = ApiCustomer & {
    deals?: Array<{
        id: string;
        title: string;
        amount: number;
        status: string;
        createdAt: string;
    }>;
    reservations?: Array<{
        id: string;
        reservationNumber: string;
        status: string;
        createdAt: string;
        unit?: {
            id: string;
            unitNumber: string;
        } | null;
    }>;
    contracts?: Array<{
        id: string;
        contractNumber: string;
        status: string;
        totalPrice: number;
        createdAt: string;
    }>;
};
