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