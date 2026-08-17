import { z } from "zod";
export declare const createCustomerSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    phone: z.ZodOptional<z.ZodString>;
    nationalId: z.ZodOptional<z.ZodString>;
    tinNumber: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateCustomerSchemaInput = z.infer<typeof createCustomerSchema>;
export declare const updateCustomerSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    nationalId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    tinNumber: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    address: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    country: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type UpdateCustomerSchemaInput = z.infer<typeof updateCustomerSchema>;
