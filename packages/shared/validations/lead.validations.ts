import { z } from "zod";

export const createLeadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  status: z.string().optional(),
  sourceId: z.string().optional(),
  ownerId: z.string().optional(),
  interestedProjectId: z.string().optional(),
  telegramHandle: z.string().optional(),
  websiteInquiryUrl: z.string().optional(),
  budgetMinETB: z.number().optional(),
  budgetMaxETB: z.number().optional(),
  timeline: z.string().optional(),
  preferredBedrooms: z.number().optional(),
  preferredPaymentPlan: z.string().optional(),
});

export type CreateLeadSchemaInput = z.infer<typeof createLeadSchema>;

export const updateLeadSchema = createLeadSchema.partial();

export type UpdateLeadSchemaInput = z.infer<typeof updateLeadSchema>;
