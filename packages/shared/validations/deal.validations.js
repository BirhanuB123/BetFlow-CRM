"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDealSchema = exports.createDealSchema = void 0;
const zod_1 = require("zod");
exports.createDealSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Deal title is required"),
    customerId: zod_1.z.string().min(1, "Customer is required"),
    unitId: zod_1.z.string().optional(),
    stageId: zod_1.z.string().min(1, "Stage is required"),
    amount: zod_1.z.number().min(0, "Amount must be positive"),
    expectedCloseDate: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.updateDealSchema = exports.createDealSchema.partial();
//# sourceMappingURL=deal.validations.js.map