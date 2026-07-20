import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PasswordService } from '../auth/password.service';
import { PrismaService } from '../database/prisma.service';

export type InviteUserBody = {
  name: string;
  email: string;
  roleId: string;
  password?: string;
};

type UserResult = any;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
  ) {}

  async listUsers() {

    const users = await this.prisma.user.findMany({
      where: {},
      orderBy: { createdAt: 'desc' },
      include: {
        roles: {
          where: {},
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

    return users;
  }

  async inviteUser(input: InviteUserBody) {

    const role = await this.prisma.role.findFirst({
      where: {
        id: input.roleId,
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
          email: input.email.trim().toLowerCase(),
          password,
          firstName,
          lastName,
          roles: {
            create: {
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
          action: 'user.invited',
          entityType: 'User',
          entityId: user.id,
          newValues: {
            email: user.email,
            roleId: input.roleId,
          },
        },
      });

      return user;
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
