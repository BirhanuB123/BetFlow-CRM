import { ForbiddenException } from '@nestjs/common';
import type { AuthenticatedUser } from '../../core/auth/auth.types';

export function assertEntityOwnership(
  user: AuthenticatedUser | string,
  ownerId: string | null | undefined,
  entityName = 'resource',
) {
  if (!user) {
    throw new ForbiddenException('User authentication is required');
  }

  if (typeof user === 'string') {
    if (ownerId && ownerId !== user) {
      throw new ForbiddenException(
        `You do not have permission to modify or delete this ${entityName}`,
      );
    }
    return;
  }

  const isAdminOrManager = user.roles?.some((role) => {
    const r = role.toLowerCase();
    return r === 'owner' || r === 'admin' || r === 'manager';
  });

  if (isAdminOrManager) {
    return;
  }

  if (ownerId && ownerId !== user.id) {
    throw new ForbiddenException(
      `You do not have permission to modify or delete this ${entityName}`,
    );
  }
}
