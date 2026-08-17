"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signContractSchema = exports.createContractSchema = void 0;
const zod_1 = require("zod");
exports.createContractSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Contract title is required"),
    customerId: zod_1.z.string().min(1, "Customer is required"),
    unitId: zod_1.z.string().min(1, "Unit is required"),
    totalPrice: zod_1.z.number().min(0, "Total price must be positive"),
    downpaymentAmount: zod_1.z.number().min(0, "Downpayment amount must be positive"),
    startDate: zod_1.z.string().optional(),
    terms: zod_1.z.string().optional(),
});
exports.signContractSchema = zod_1.z.object({
    contractId: zod_1.z.string().min(1, "Contract ID is required"),
    signatureDataUrl: zod_1.z.string().min(1, "Signature image is required"),
    signerRole: zod_1.z.string().min(1, "Signer role is required"),
});
//# sourceMappingURL=contract.validations.js.map