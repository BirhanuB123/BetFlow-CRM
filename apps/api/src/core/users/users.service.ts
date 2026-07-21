import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PasswordService } from '../../core/auth/password.service';
import { PrismaService } from '../../database/prisma.service';

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

    return users.map((user) => {
      const primaryRole = user.roles[0]?.role;
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        status: user.isActive ? 'active' : 'inactive',
        createdAt: user.createdAt,
        roleId: primaryRole?.id,
        roleName: primaryRole?.name,
      };
    });
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
    const password = await this.passwords.hash(
      input.password ?? 'ChangeMe123!',
    );

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

  async updateUserRole(id: string, roleId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} was not found`);
    }

    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role ${roleId} was not found`);
    }

    await this.prisma.userRole.deleteMany({ where: { userId: id } });

    const userRole = await this.prisma.userRole.create({
      data: {
        userId: id,
        roleId,
      },
      include: {
        role: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'user.role_updated',
        entityType: 'User',
        entityId: id,
        newValues: {
          roleId,
          roleName: role.name,
        },
      },
    });

    return userRole;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} was not found`);
    }

    try {
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      await this.prisma.user.delete({ where: { id } });

      await this.prisma.auditLog.create({
        data: {
          action: 'user.deleted',
          entityType: 'User',
          entityId: id,
        },
      });
      return { id, deleted: true };
    } catch (err) {
      await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      await this.prisma.auditLog.create({
        data: {
          action: 'user.deactivated',
          entityType: 'User',
          entityId: id,
        },
      });

      return { id, deleted: false, isActive: false };
    }
  }
}
