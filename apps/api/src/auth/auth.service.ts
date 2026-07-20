import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordService } from './password.service';
import { JwtService } from './jwt.service';
import { PrismaService } from '../database/prisma.service';
import type { AuthenticatedUser } from './auth.types';

export type LoginBody = {
  email: string;
  password: string;
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
  ) {}

  async login(input: LoginBody) {
    const user = await this.prisma.user.findFirst({
      where: {
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
          email: user.email,
          roles,
        },
        expiresIn,
      ),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      expiresIn,
      authMethod: 'password',
    };
  }

  async currentUser(authenticatedUser: AuthenticatedUser) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: authenticatedUser.id,
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

    if (!user) {
      throw new UnauthorizedException('Invalid token subject');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
}
