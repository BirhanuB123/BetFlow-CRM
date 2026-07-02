import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PasswordService } from '../auth/password.service';
import { PrismaService } from '../database/prisma.service';
import { TenantsService } from '../tenants/tenants.service';

export type InviteUserBody = {
  tenantId: string;
  name: string;
  email: string;
  roleId: string;
  password?: string;
};

type UserResult = Parameters<TenantsService['serializeUser']>[0];

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly tenants: TenantsService,
  ) {}

  async listUsers(tenantId?: string) {
    if (!tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    const users = await this.prisma.user.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        roles: {
          where: { tenantId },
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

    return (users as UserResult[]).map((user) =>
      this.tenants.serializeUser(user),
    );
  }

  async inviteUser(input: InviteUserBody) {
    if (!input.tenantId) {
      throw new BadRequestException('tenantId is required');
    }

    const role = await this.prisma.role.findFirst({
      where: {
        id: input.roleId,
        tenantId: input.tenantId,
      },
    });

    if (!role) {
      throw new NotFoundException(`Role ${input.roleId} was not found`);
    }

    const { firstName, lastName } = this.splitName(input.name);
    const password = await this.passwords.hash(input.password ?? 'ChangeMe123!');

    try {
      const user = await this.prisma.user.create({
        data: {
          tenantId: input.tenantId,
          email: input.email.trim().toLowerCase(),
          password,
          firstName,
          lastName,
          roles: {
            create: {
              tenantId: input.tenantId,
              roleId: input.roleId,
            },
          },
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

      await this.prisma.auditLog.create({
        data: {
          tenantId: input.tenantId,
          action: 'user.invited',
          entityType: 'User',
          entityId: user.id,
          newValues: {
            email: user.email,
            roleId: input.roleId,
          },
        },
      });

      return this.tenants.serializeUser(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('User email already exists');
      }

      throw error;
    }
  }

  private splitName(name: string) {
    const parts = name.trim().split(/\s+/);
    const firstName = parts.shift() ?? 'Invited';
    const lastName = parts.join(' ') || 'User';

    return { firstName, lastName };
  }
}
