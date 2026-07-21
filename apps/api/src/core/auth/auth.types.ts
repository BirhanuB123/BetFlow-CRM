/**
 * Re-exports auth types from @betflow/shared.
 * The source of truth is now packages/shared/types/user.types.ts
 */
export type {
  AuthenticatedUser,
  JwtPayload,
  AuthenticatedRequest,
} from '@betflow/shared';
