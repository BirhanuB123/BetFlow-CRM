import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export type CreateRoleBody = {
  name: string;
  description?: string;
  permissionIds?: string[];
  permissionKeys?: string[];
};

type PermissionResult = {
  id: string;
  name: string;
  module: string;
  description: string | null;
};

type RolePermissionResult = {
  permission: PermissionResult;
};

type RoleResult = {
  id: string;
  name: string;
  description: string | null;
  permissions: RolePermissionResult[];
};

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async listRoles() {

    const roles = await this.prisma.role.findMany({
      where: {},
      orderBy: { name: 'asc' },
      include: {
        permissions: {
          where: {},
          include: {
            permission: true,
          },
        },
      },
    });

    return (roles as RoleResult[]).map((role) => ({
      ...role,
      permissionKeys: role.permissions.map((item) => item.permission.name),
      permissions: role.permissions.map((item) => item.permission),
    }));
  }

  async createRole(input: CreateRoleBody) {

    const permissions = await this.resolvePermissions(input);
    const role = await this.prisma.role.create({
      data: {
        name: input.name,
        description: input.description,
        permissions: {
          create: (permissions as PermissionResult[]).map((permission) => ({
            permissionId: permission.id,
          })),
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'role.created',
        entityType: 'Role',
        entityId: role.id,
        newValues: {
          name: role.name,
          permissionIds: (permissions as PermissionResult[]).map((permission) => permission.id),
        },
      },
    });

    return {
      ...(role as RoleResult),
      permissionKeys: (role as RoleResult).permissions.map(
        (item) => item.permission.name,
      ),
      permissions: (role as RoleResult).permissions.map(
        (item) => item.permission,
      ),
    };
  }

  private async resolvePermissions(input: CreateRoleBody) {
    if (input.permissionIds?.length) {
      return this.prisma.permission.findMany({
        where: {
          id: { in: input.permissionIds },
        },
      });
    }

    if (input.permissionKeys?.length) {
      return this.prisma.permission.findMany({
        where: {
          name: { in: input.permissionKeys },
        },
      });
    }

    return [];
  }
}
