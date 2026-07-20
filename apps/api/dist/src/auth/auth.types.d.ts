export type AuthenticatedUser = {
    id: string;
    email: string;
    roles: string[];
};
export type JwtPayload = {
    sub: string;
    email: string;
    roles: string[];
    iat: number;
    exp: number;
};
export type AuthenticatedRequest = {
    headers: {
        authorization?: string;
    };
    user?: AuthenticatedUser;
};
