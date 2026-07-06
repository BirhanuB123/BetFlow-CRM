export type CreateCustomerInput = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
};

export type UpdateCustomerInput = {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
};