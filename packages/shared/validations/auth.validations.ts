import { z } from "zod";

export const PASSWORD_REGEX =
  /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export const PASSWORD_MESSAGE =
  "Password must be at least 8 characters long and contain uppercase, lowercase, and a number or special symbol";

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please provide a valid email address").min(1, "Email is required"),
  password: z
    .string()
    .min(8, PASSWORD_MESSAGE)
    .regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
  inviteCode: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address").min(1, "Email is required"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address").min(1, "Email is required"),
  token: z.string().min(1, "Reset code is required"),
  newPassword: z
    .string()
    .min(8, PASSWORD_MESSAGE)
    .regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
