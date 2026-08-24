import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, ROLES_KEY } from '../decorators/roles.decorator';
import type { AuthenticatedRequest } from '../../core/auth/auth.types';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Optional() @Inject(PrismaService) private readonly prisma?: PrismaService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length && !requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userPermissions = request.user?.permissions ?? [];
    const userRoles = request.user?.roles ?? [];

    // 1. Check permission match
    if (requiredPermissions?.length) {
      const hasPermission = requiredPermissions.some((perm) =>
        userPermissions.includes(perm),
      );
      if (hasPermission) return true;
    }

    // 2. Check role match for legacy @Roles annotations
    if (requiredRoles?.length) {
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));
      if (hasRole) return true;
    }

    // 3. Log forbidden access attempt to audit log if prisma service is available
    if (this.prisma && request.user?.id) {
      this.prisma.auditLog
        .create({
          data: {
            userId: request.user.id,
            action: 'auth.forbidden_access',
            entityType: 'Endpoint',
            entityId: (request as any).url || (request as any).originalUrl || 'unknown',
            newValues: {
              userRoles,
              userPermissions,
              requiredPermissions,
              requiredRoles,
            },
          },
        })
        .catch(() => {});
    }

    return false;
  }
}

@Injectable()
export class PermissionsGuard extends RolesGuard {}
