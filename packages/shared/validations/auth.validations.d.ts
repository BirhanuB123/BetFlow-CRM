import { z } from "zod";
export declare const PASSWORD_REGEX: RegExp;
export declare const PASSWORD_MESSAGE = "Password must be at least 8 characters long and contain uppercase, lowercase, and a number or special symbol";
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const registerSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    inviteCode: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type RegisterInput = z.infer<typeof registerSchema>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export declare const resetPasswordSchema: z.ZodObject<{
    email: z.ZodString;
    token: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
