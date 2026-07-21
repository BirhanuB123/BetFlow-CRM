import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './auth.types';
type LoginBody = {
    email: string;
    password: string;
};
type RegisterBody = {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
};
type UpdateProfileBody = {
    firstName: string;
    lastName: string;
};
type ChangePasswordBody = {
    currentPassword: string;
    newPassword: string;
};
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(body: RegisterBody): Promise<{
        success: boolean;
        userId: string;
    }>;
    login(body: LoginBody): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        expiresIn: number;
        authMethod: string;
    }>;
    me(user: AuthenticatedUser): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    }>;
    updateProfile(user: AuthenticatedUser, body: UpdateProfileBody): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    }>;
    changePassword(user: AuthenticatedUser, body: ChangePasswordBody): Promise<{
        success: boolean;
    }>;
}
export {};
