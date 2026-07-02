import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '../../auth/jwt.service';
export declare class JwtAuthGuard implements CanActivate {
    private readonly jwt;
    constructor(jwt: JwtService);
    canActivate(context: ExecutionContext): boolean;
    private getBearerToken;
}
