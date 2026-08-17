"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLeadSchema = exports.createLeadSchema = void 0;
const zod_1 = require("zod");
exports.createLeadSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    company: zod_1.z.string().optional(),
    email: zod_1.z.string().email("Invalid email address").optional().or(zod_1.z.literal("")),
    phone: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    sourceId: zod_1.z.string().optional(),
    ownerId: zod_1.z.string().optional(),
    interestedProjectId: zod_1.z.string().optional(),
    telegramHandle: zod_1.z.string().optional(),
    websiteInquiryUrl: zod_1.z.string().optional(),
    budgetMinETB: zod_1.z.number().optional(),
    budgetMaxETB: zod_1.z.number().optional(),
    timeline: zod_1.z.string().optional(),
    preferredBedrooms: zod_1.z.number().optional(),
    preferredPaymentPlan: zod_1.z.string().optional(),
});
exports.updateLeadSchema = exports.createLeadSchema.partial();
//# sourceMappingURL=lead.validations.js.map