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
    inviteCode?: string;
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

    const passwordRegex =
      /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

    if (
      !input.password ||
      input.password.trim().length < 8 ||
      !passwordRegex.test(input.password)
    ) {
      throw new BadRequestException(
        'Password must be at least 8 characters long and contain uppercase, lowercase, and a number or special symbol',
      );
    }

    const email = input.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new UnauthorizedException('User already exists');
    }

    const passwordHash = await this.passwords.hash(input.password.trim());

    // Admin Invite Code Validation (defaults to BETFLOW-VIP-2026 if env not specified)
    const submittedCode = input.inviteCode?.trim().toUpperCase();
    const validCode =
      process.env.ADMIN_INVITE_CODE?.trim().toUpperCase() ||
      'BETFLOW-VIP-2026';
    const isAutoApproved = Boolean(submittedCode && submittedCode === validCode);

    const defaultRole = await this.prisma.role.findFirst({
      where: {
        name: {
          in: ['Agent', 'agent', 'User', 'user', 'Member', 'member'],
        },
      },
    });

    const user = await this.prisma.user.create({
      data: {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        email,
        password: passwordHash,
        isActive: isAutoApproved,
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

    if (!isAutoApproved) {
      const activeAdmins = await this.prisma.user.findMany({
        where: { isActive: true },
        take: 5,
      });

      for (const admin of activeAdmins) {
        await this.prisma.notification.create({
          data: {
            userId: admin.id,
            title: '⏳ New Account Registration Pending Approval',
            message: `User ${user.firstName} ${user.lastName} (${user.email}) registered and is awaiting admin approval to activate access.`,
          },
        });
      }
    }

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: isAutoApproved
          ? 'auth.register_approved'
          : 'auth.register_pending_approval',
        entityType: 'User',
        entityId: user.id,
        newValues: {
          isActive: isAutoApproved,
          requiresApproval: !isAutoApproved,
        },
      },
    });

    return {
      success: true,
      userId: user.id,
      requiresApproval: !isAutoApproved,
      message: isAutoApproved
        ? 'Account registered and activated successfully!'
        : 'Account registered successfully! Your account is pending manager approval before you can sign in.',
    };
  }

  async login(input: LoginBody) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: input.email.trim().toLowerCase(),
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
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account is pending manager approval. Please contact your system administrator to activate access.',
      );
    }

    // Check if account is currently locked out
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remainingMins = Math.ceil(
        (user.lockoutUntil.getTime() - Date.now()) / (1000 * 60),
      );
      throw new UnauthorizedException(
        `Account temporarily locked due to 5 consecutive failed login attempts. Please try again in ${remainingMins} minute(s).`,
      );
    }

    const isValidPassword = await this.passwords.verify(
      input.password,
      user.password,
    );

    if (!isValidPassword) {
      const newAttempts = (user.failedLoginAttempts ?? 0) + 1;
      const MAX_ATTEMPTS = 5;

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutTime = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: newAttempts,
            lockoutUntil: lockoutTime,
          },
        });

        await this.prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'auth.account_locked',
            entityType: 'User',
            entityId: user.id,
            newValues: {
              failedLoginAttempts: newAttempts,
              lockoutUntil: lockoutTime,
            },
          },
        });

        throw new UnauthorizedException(
          'Too many failed login attempts. Account temporarily locked for 15 minutes.',
        );
      } else {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: newAttempts,
          },
        });

        throw new UnauthorizedException('Invalid credentials');
      }
    }

    // Reset failed login counters on successful authentication
    if (user.failedLoginAttempts > 0 || user.lockoutUntil !== null) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockoutUntil: null,
        },
      });
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
    const expiresIn = 900; // 15 minutes
    const refreshExpiresIn = 604800; // 7 days

    const accessToken = this.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        roles,
        type: 'access',
      },
      expiresIn,
    );

    const refreshToken = this.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'refresh',
      },
      refreshExpiresIn,
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
      refreshExpiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
      authMethod: 'password',
    };
  }

  async refreshToken(refreshTokenString: string) {
    if (!refreshTokenString?.trim()) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const payload = this.jwt.verify(refreshTokenString.trim());
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type for session refresh');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
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
      throw new UnauthorizedException(
        'User account has been deactivated or no longer exists.',
      );
    }

    const roles = (user.roles as UserRoleResult[]).map(
      (item) => item.role.name,
    );
    const expiresIn = 900; // 15 minutes
    const refreshExpiresIn = 604800; // 7 days

    const accessToken = this.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        roles,
        type: 'access',
      },
      expiresIn,
    );

    const newRefreshToken = this.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'refresh',
      },
      refreshExpiresIn,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn,
      refreshExpiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
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
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async updateProfile(
    userId: string,
    body: { firstName: string; lastName: string; avatarUrl?: string },
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

    const avatarUrl = body?.avatarUrl !== undefined ? body.avatarUrl : user.avatarUrl;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        avatarUrl,
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
          avatarUrl: updated.avatarUrl,
        },
      },
    });

    return {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      avatarUrl: updated.avatarUrl,
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

    const passwordRegex =
      /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

    if (
      !body?.newPassword ||
      body.newPassword.trim().length < 8 ||
      !passwordRegex.test(body.newPassword)
    ) {
      throw new BadRequestException(
        'New password must be at least 8 characters long and contain uppercase, lowercase, and a number or special symbol',
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

  async requestPasswordReset(emailInput: string) {
    if (!emailInput?.trim()) {
      throw new BadRequestException('Email is required');
    }

    const email = emailInput.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email, isActive: true },
    });

    if (!user) {
      return {
        success: true,
        message:
          'If an active account exists for that email, a 6-digit password reset code has been generated.',
      };
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: user.id,
        title: '🔑 Password Reset Request',
        message: `Your 6-digit password reset code is: ${resetToken}. Code expires in 15 minutes.`,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'auth.password_reset_requested',
        entityType: 'User',
        entityId: user.id,
      },
    });

    return {
      success: true,
      message: `Password reset code sent! Your verification code is: ${resetToken}`,
      resetToken,
    };
  }

  async resetPasswordWithToken(body: {
    email: string;
    token: string;
    newPassword: string;
  }) {
    if (!body?.email?.trim() || !body?.token?.trim()) {
      throw new BadRequestException('Email and reset code are required');
    }

    const email = body.email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email, isActive: true },
    });

    if (
      !user ||
      !user.resetToken ||
      user.resetToken !== body.token.trim() ||
      !user.resetTokenExpiry ||
      user.resetTokenExpiry < new Date()
    ) {
      throw new BadRequestException(
        'Invalid or expired password reset code. Please request a new code.',
      );
    }

    const passwordRegex =
      /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

    if (
      !body?.newPassword ||
      body.newPassword.trim().length < 8 ||
      !passwordRegex.test(body.newPassword)
    ) {
      throw new BadRequestException(
        'New password must be at least 8 characters long and contain uppercase, lowercase, and a number or special symbol',
      );
    }

    const hashed = await this.passwords.hash(body.newPassword.trim());
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
        failedLoginAttempts: 0,
        lockoutUntil: null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'auth.password_reset_completed',
        entityType: 'User',
        entityId: user.id,
      },
    });

    return {
      success: true,
      message:
        'Password reset successfully! You can now sign in with your new password.',
    };
  }
}
