import type { JwtPayload } from './auth.types';
export declare class JwtService {
    private readonly secret;
    sign(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresInSeconds?: number): string;
    verify(token: string): JwtPayload;
    private signSegments;
    private encode;
    private decode;
    private matches;
}
