import { z } from "zod";

export const createContractSchema = z.object({
  title: z.string().min(1, "Contract title is required"),
  customerId: z.string().min(1, "Customer is required"),
  unitId: z.string().min(1, "Unit is required"),
  totalPrice: z.number().min(0, "Total price must be positive"),
  downpaymentAmount: z.number().min(0, "Downpayment amount must be positive"),
  startDate: z.string().optional(),
  terms: z.string().optional(),
});

export type CreateContractSchemaInput = z.infer<typeof createContractSchema>;

export const signContractSchema = z.object({
  contractId: z.string().min(1, "Contract ID is required"),
  signatureDataUrl: z.string().min(1, "Signature image is required"),
  signerRole: z.string().min(1, "Signer role is required"),
});

export type SignContractSchemaInput = z.infer<typeof signContractSchema>;
