import { PasswordService } from './password.service';
import { JwtService } from './jwt.service';
import { PrismaService } from '../database/prisma.service';
import type { AuthenticatedUser } from './auth.types';
export type LoginBody = {
    email: string;
    password: string;
};
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    private readonly passwords;
    constructor(prisma: PrismaService, jwt: JwtService, passwords: PasswordService);
    register(input: {
        firstName: string;
        lastName: string;
        email: string;
        password?: string;
    }): Promise<{
        success: boolean;
        userId: string;
    }>;
    login(input: LoginBody): Promise<{
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
    currentUser(authenticatedUser: AuthenticatedUser): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    }>;
}
