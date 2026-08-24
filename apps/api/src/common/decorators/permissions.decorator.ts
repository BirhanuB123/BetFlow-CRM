import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from './roles.decorator';

export { PERMISSIONS_KEY };

export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const Permissions = RequirePermission;
