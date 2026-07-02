export type AuthenticatedUser = {
  id: string;
  tenantId: string;
  email: string;
  roles: string[];
};

export type JwtPayload = {
  sub: string;
  tenantId: string;
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
