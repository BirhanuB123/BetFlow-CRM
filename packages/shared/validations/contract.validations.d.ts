import { z } from "zod";
export declare const createContractSchema: z.ZodObject<{
    title: z.ZodString;
    customerId: z.ZodString;
    unitId: z.ZodString;
    totalPrice: z.ZodNumber;
    downpaymentAmount: z.ZodNumber;
    startDate: z.ZodOptional<z.ZodString>;
    terms: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateContractSchemaInput = z.infer<typeof createContractSchema>;
export declare const signContractSchema: z.ZodObject<{
    contractId: z.ZodString;
    signatureDataUrl: z.ZodString;
    signerRole: z.ZodString;
}, z.core.$strip>;
export type SignContractSchemaInput = z.infer<typeof signContractSchema>;
