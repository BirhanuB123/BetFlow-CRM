import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '../../core/auth/jwt.service';
import { PrismaService } from '../../database/prisma.service';
import type { AuthenticatedRequest } from '../../core/auth/auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.getBearerToken(request.headers.authorization);
    const payload = this.jwt.verify(token);

    if (payload.type === 'refresh') {
      throw new UnauthorizedException(
        'Refresh token cannot be used for resource access. Please use an access token.',
      );
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(
        'User account has been deactivated or no longer exists.',
      );
    }

    request.user = {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles ?? [],
      permissions: payload.permissions ?? [],
    };

    return true;
  }

  private getBearerToken(authorization?: string) {
    const [scheme, token] = authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Bearer token required');
    }

    return token;
  }
}
