import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordService } from './password.service';
import { JwtService } from './jwt.service';
import { PrismaService } from '../database/prisma.service';
import { RegisterTenantBody, TenantsService } from '../tenants/tenants.service';
import type { AuthenticatedUser } from './auth.types';

export type LoginBody = {
  email: string;
  password: string;
  tenantSlug: string;
};

type UserRoleResult = {
  role: {
    name: string;
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly passwords: PasswordService,
    private readonly tenants: TenantsService,
  ) {}

  async register(input: RegisterTenantBody) {
    return this.tenants.registerTenant(input);
  }

  async login(input: LoginBody) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { domain: input.tenantSlug.trim().toLowerCase() },
    });

    if (!tenant) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        email: input.email.trim().toLowerCase(),
        isActive: true,
      },
      include: {
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (
      !user ||
      !(await this.passwords.verify(input.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        action: 'auth.login',
        entityType: 'User',
        entityId: user.id,
      },
    });

    const roles = (user.roles as UserRoleResult[]).map((item) => item.role.name);
    const expiresIn = 3600;
    return {
      accessToken: this.jwt.sign(
        {
          sub: user.id,
          tenantId: tenant.id,
          email: user.email,
          roles,
        },
        expiresIn,
      ),
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.domain,
        domain: tenant.domain,
      },
      user: this.tenants.serializeUser(user),
      expiresIn,
      authMethod: 'password',
    };
  }

  async currentUser(authenticatedUser: AuthenticatedUser) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: authenticatedUser.id,
        tenantId: authenticatedUser.tenantId,
        isActive: true,
      },
      include: {
        tenant: true,
        roles: {
          where: { tenantId: authenticatedUser.tenantId },
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token subject');
    }

    return {
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.domain,
        domain: user.tenant.domain,
      },
      user: this.tenants.serializeUser(user),
    };
  }
}
