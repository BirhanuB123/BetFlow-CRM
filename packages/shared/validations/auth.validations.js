"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.registerSchema = exports.loginSchema = exports.PASSWORD_MESSAGE = exports.PASSWORD_REGEX = void 0;
const zod_1 = require("zod");
exports.PASSWORD_REGEX = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
exports.PASSWORD_MESSAGE = "Password must be at least 8 characters long and contain uppercase, lowercase, and a number or special symbol";
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Please provide a valid email address").min(1, "Email is required"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.registerSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    email: zod_1.z.string().email("Please provide a valid email address").min(1, "Email is required"),
    password: zod_1.z
        .string()
        .min(8, exports.PASSWORD_MESSAGE)
        .regex(exports.PASSWORD_REGEX, exports.PASSWORD_MESSAGE),
    inviteCode: zod_1.z.string().optional(),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Please provide a valid email address").min(1, "Email is required"),
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Please provide a valid email address").min(1, "Email is required"),
    token: zod_1.z.string().min(1, "Reset code is required"),
    newPassword: zod_1.z
        .string()
        .min(8, exports.PASSWORD_MESSAGE)
        .regex(exports.PASSWORD_REGEX, exports.PASSWORD_MESSAGE),
});
//# sourceMappingURL=auth.validations.js.map