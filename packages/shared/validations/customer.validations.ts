import { z } from "zod";

export const createCustomerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  nationalId: z.string().optional(),
  tinNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateCustomerSchemaInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial();

export type UpdateCustomerSchemaInput = z.infer<typeof updateCustomerSchema>;
