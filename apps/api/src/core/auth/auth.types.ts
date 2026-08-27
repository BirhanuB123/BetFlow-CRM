export type { AuthenticatedUser, AuthenticatedRequest } from '@betflow/shared';

export type JwtPayload = {
  sub: string;
  email: string;
  roles?: string[];
  permissions?: string[];
  mustChangePassword?: boolean;
  type?: 'access' | 'refresh';
  iat: number;
  exp: number;
};
