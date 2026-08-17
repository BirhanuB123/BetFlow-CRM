import { z } from "zod";
export declare const createDealSchema: z.ZodObject<{
    title: z.ZodString;
    customerId: z.ZodString;
    unitId: z.ZodOptional<z.ZodString>;
    stageId: z.ZodString;
    amount: z.ZodNumber;
    expectedCloseDate: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateDealSchemaInput = z.infer<typeof createDealSchema>;
export declare const updateDealSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    customerId: z.ZodOptional<z.ZodString>;
    unitId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    stageId: z.ZodOptional<z.ZodString>;
    amount: z.ZodOptional<z.ZodNumber>;
    expectedCloseDate: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type UpdateDealSchemaInput = z.infer<typeof updateDealSchema>;
