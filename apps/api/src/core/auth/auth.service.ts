import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PasswordService } from './password.service';
import { JwtService } from './jwt.service';
import { PrismaService } from '../../database/prisma.service';
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

  async register(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    if (
      !input.firstName?.trim() ||
      !input.lastName?.trim() ||
      !input.email?.trim()
    ) {
      throw new BadRequestException(
        'firstName, lastName, and email are required',
      );
    }

    if (!input.password || input.password.trim().length < 8) {
      throw new BadRequestException(
        'password is required and must be at least 8 characters long',
      );
    }

    const email = input.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new UnauthorizedException('User already exists');
    }

    const passwordHash = await this.passwords.hash(input.password.trim());

    const defaultRole = await this.prisma.role.findFirst({
      where: {
        name: {
          in: ['Agent', 'agent', 'User', 'user', 'Member', 'member'],
        },
      },
    });

    const user = await this.prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email,
        password: passwordHash,
        roles: defaultRole
          ? {
              create: [
                {
                  roleId: defaultRole.id,
                },
              ],
            }
          : undefined,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'auth.register',
        entityType: 'User',
        entityId: user.id,
      },
    });

    return { success: true, userId: user.id };
  }

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

    const roles = (user.roles as UserRoleResult[]).map(
      (item) => item.role.name,
    );
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

  async updateProfile(
    userId: string,
    body: { firstName: string; lastName: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User was not found`);
    }

    const firstName = body?.firstName?.trim();
    const lastName = body?.lastName?.trim();

    if (!firstName || !lastName) {
      throw new BadRequestException('firstName and lastName are required');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'user.profile_updated',
        entityType: 'User',
        entityId: userId,
        newValues: {
          firstName: updated.firstName,
          lastName: updated.lastName,
        },
      },
    });

    return {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
    };
  }

  async changePassword(
    userId: string,
    body: { currentPassword: string; newPassword: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User was not found`);
    }

    if (!body?.newPassword || body.newPassword.trim().length < 8) {
      throw new BadRequestException(
        'newPassword is required and must be at least 8 characters long',
      );
    }

    const matched = await this.passwords.verify(
      body.currentPassword || '',
      user.password,
    );
    if (!matched) {
      throw new BadRequestException('Current password does not match');
    }

    const hashed = await this.passwords.hash(body.newPassword.trim());
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'user.password_changed',
        entityType: 'User',
        entityId: userId,
      },
    });

    return { success: true };
  }
}
