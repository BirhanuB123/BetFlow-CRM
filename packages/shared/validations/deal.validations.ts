import { z } from "zod";

export const createDealSchema = z.object({
  title: z.string().min(1, "Deal title is required"),
  customerId: z.string().min(1, "Customer is required"),
  unitId: z.string().optional(),
  stageId: z.string().min(1, "Stage is required"),
  amount: z.number().min(0, "Amount must be positive"),
  expectedCloseDate: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateDealSchemaInput = z.infer<typeof createDealSchema>;

export const updateDealSchema = createDealSchema.partial();

export type UpdateDealSchemaInput = z.infer<typeof updateDealSchema>;
