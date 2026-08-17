"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
exports.createCustomerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    email: zod_1.z.string().email("Invalid email address").optional().or(zod_1.z.literal("")),
    phone: zod_1.z.string().optional(),
    nationalId: zod_1.z.string().optional(),
    tinNumber: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.updateCustomerSchema = exports.createCustomerSchema.partial();
//# sourceMappingURL=customer.validations.js.map